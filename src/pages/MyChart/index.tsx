import {deleteBiChartUsingPost, listBiChartByPageUsingPost} from "@/services/zoubi/biChartController";
import React, {useEffect, useState} from "react";
import { Avatar, Button, Card, List, message, Result} from "antd";
import ReactECharts from "echarts-for-react";
import {useModel} from "@@/exports";
import Search from "antd/es/input/Search";

/**
 * 我的图表页面
 */
const MyChartPage: React.FC = () => {
  //定义初始条件
  //这里的属性表示初始当前页数量和当前页码
  const initSearchParams = {
    pageSize: 2,
    current: 1,
    sortField: 'create_time',    //根据创建时间排序
    sortOrder: 'desc',       //降序
  };
  //定义响应式 发送给后端的数据                  //将initSearchParams对象展开为单独属性传给useState
  const [searchParams, setSearchParams] = useState<API.BiChartQueryRequest>({
    ...initSearchParams,
  });
  //定义变量接收后端数据
  const [chartList, setChartList] = useState<API.BiChart[]>();
  //设置总数
  const [total, setTotal] = useState<number>(0);
  //获取initalState语法
  const { initialState } = useModel('@@initialState');
  //从初始信息中取出当前用户信息
  const { currentUser } = initialState ?? {};
  //定义一个loading加载效果
  const[loading,setLoading]=useState<boolean>(true);
  const loadData = async () => {
    setLoading(true);      //当触发搜索时显示加载效果
    try {
      //res接收后端响应结果，这里能展示图表的本质原因是：前面生成的图表信息存入了数据库，该方法从数据库返回图表信息
      const res = await listBiChartByPageUsingPost(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []); //若接收到数据，则传入后端的数据
        setTotal(res.data.total ?? 0);
        //隐藏图表的title
        if (res.data.records) {
          res.data.records.forEach((data) => {
            if(data.chartStatus==='succeed'){              //如果图表生成成功才去解析
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined; //提取图表表头信息，并设置为空
              data.genChart = JSON.stringify(chartOption); //重新设置回去
            }
          });
        }
      } else {
        message.error('获取图表信息失败');
      }
    } catch (e: any) {
      message.error('获取图表信息失败' + e.message);
    }
    setLoading(false);  //搜索结束隐藏加载效果
  };

  //处理图表删除
  const handleDeleteChart = async (id:number) => {
    //对接后端,上传数据
    const params={
      id
    }
    setLoading(true);  //当触发删除时显示加载效果
    try {
      // 后端有一个 API 可以通过 ID 删除图表
      const res=await deleteBiChartUsingPost(params);
      if(res.code===200){
        message.success('图表删除成功');
        // 重新加载数据
        loadData();
      }else {
        message.error(res.message); //把后端返回的message提示出来
      }
    } catch (error: any) {
      message.error(`删除图表失败: ${error.message}`);
    }
    setLoading(false);  //当结束删除时隐藏加载效果
  };


  //useEffect用于在函数组件中执行副作用操作
  //在组件首次渲染和 searchParams 变化时执行
  //每当 searchParams 发生变化时，loadData 函数将被调用，从而更新 chartList 和 total 状态
  useEffect(() => {
    loadData();
  }, [searchParams]);

  //return 展示上面获取的数据
  return (
    <div className="addChart">
      <div>
        <Search
          placeholder="请输入图表名称"
          enterButton="搜索"
          size="large"
          loading={loading}
          onSearch={(value) => {
            setSearchParams({
              //当页面发生改变触发onSearch事件，
              ...initSearchParams, // 传入原始的initSearchParams,只改变chartName
              chartName: value, //输入框的值赋给searchParams的chartName属性
            });
          }}
        />
      </div>
      <br />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams, //当切换页面时，触发onchange，调整当前页码和每页显示的记录数
              current: page,
              pageSize,
            });
          },
          current: searchParams.current, //设置为最新当前页码
          pageSize: searchParams.pageSize, //设置为每页显示的记录数
          total: total,
          showQuickJumper: true, //是否可以快速跳转至某页
          showSizeChanger: total > 2, //展示 pageSize 切换器
        }}
        loading={loading} //给List组件执行加载效果
        dataSource={chartList} //数据源设置成从后端获取到的数据列表
        renderItem={(
          item, //item是在该函数中传递进来的参数，其实就是chartList
        ) => (
          <List.Item key={item.id}>
            <Card style={{ width: '100%', height: 650 }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser.userAvatar} />} //渲染当前用户头像
                title={<strong>{item.chartName}</strong>}
                description={
                  <>
                    {item.chartType ? '图表类型：' + item.chartType : undefined}
                    <Button
                      onClick={() => handleDeleteChart(item.id)}
                      loading={loading}
                      style={{ marginLeft: 420 }}
                      type="primary"
                      size={'small'}
                      danger
                    >
                      删除
                    </Button>
                  </>
                }
              />
              <p>{'分析目标：' + item.goal}</p>
              {item.chartStatus === 'running' && (
                <>
                  <Result status="info" title="图表生成中" subTitle={item.execMessage} />
                </>
              )}
              {item.chartStatus === 'failed' && (
                <>
                  <Result status="error" title="图表生成失败" subTitle={item.execMessage} />
                </>
              )}
              {item.chartStatus === 'wait' && (
                <>
                  <Result
                    status="warning"
                    title="图表待生成"
                    subTitle={item.execMessage ?? '当前图表生成繁忙，请耐心等待'}
                  />
                </>
              )}
              {item.chartStatus === 'succeed' && (
                <>
                  {'创建时间：' + item.update_time}<br/>
                  {'分析结论：' + item.genResult}
                  <div style={{ marginBottom: 16 }} />
                  <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                </>
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
