import {
  Button, Card, Col, Divider,
  Form, Input, message, Row,
  Select, Spin,
  Upload,
} from 'antd';
import React, {useState} from 'react';
import TextArea from "antd/es/input/TextArea";
import {UploadOutlined} from "@ant-design/icons";
import {genChartByAiUsingPost} from "@/services/zoubi/biChartController";
import ReactECharts from 'echarts-for-react';
/**
 * 添加图表页面
 */

/**  拓展
 *   Async: 这个关键字用于声明一个函数是异步的。这意味着函数会在执行时返回一个 Promise 对象。当函数体内的所有操作完成时（包括任何 await 的*     表达式），这个 Promise 会被解析为函数的返回值。
 *	 Await: 这个关键字只能出现在 async 函数内部。它用于暂停异步函数的执行，直到 Promise 被解析或拒绝。这使得异步代码可以像同步代码一样被编*	写，提高了可读性。
 *    React.FC 是 React.FunctionComponent 的别名，它是一个泛型类型，用于定义无状态的函数组件
 */

const addChart: React.FC = () => {
  //定义响应式 接收后端图标信息
  const[chart,setChart]= useState<API.BiVo>();
  // 定义提交时的加载效果，默认未提交
  const[submitting,setSubmitting]= useState<boolean>(false);
  //定义option，存储图表的json数据
  const[option,setOption]=useState<any>();


  const onFinish = async (values: any) => {
    //避免重复提交
    if(submitting){
      return;
    }
    setSubmitting(true); //开始提交
    setChart(undefined);   //每次拿到数据前先设置图表以及结论信息为null，防止图表堆叠
    setOption(undefined);
    //对接后端上传数据，这里使用openAPI自动生成对接后端genChartByAi的前端方法
    const params={       //表示除了file的请求参数
      ...values,
      file:undefined
    }
    try{
      //传入前端请求致，异步拿到后端返回值
      //核心点：前端上传的file经过调试发现其里面还有一层才能取到excel数据,具体看图
      const res= await genChartByAiUsingPost(params,{},values.file.file.originFileObj)
      if(!res?.data){          // 如果 res 为空或 data 不存在，则认为失败
        message.error('分析失败')
      }else{
        message.success('分析成功')
        //解析 JSON 数据。如果 genChart 不存在，则使用空字符串作为默认值。解析结果存储在 chartOption 变量
        const chartOption=JSON.parse(res.data.genChart??'');
        if(!chartOption){
          throw new Error('图标代码解析错误');
        }else{
          setChart(res.data);     //如果得到数据，则把利用setChart封装到前面响应式的chart对象中
          setOption(chartOption);  //设置给option
        }
      }
    }catch (e:any){
      message.error('分析失败'+e.message);
    }
    setSubmitting(false); //结束提交
  };

  return (
    <div className="addChart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form
              name="addChart"
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              onFinish={onFinish} //点击提交会执行
              initialValues={{}}
            >
              <Form.Item
                name="goal"
                label="分析目标："
                rules={[{ required: true, message: '请务必输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求：比如分析用户的增长情况" />
              </Form.Item>

              <Form.Item name="chartName" label="图表名称：">
                <Input placeholder={'请输入图表名称'} />
              </Form.Item>

              <Form.Item name="chartType" label="图表类型">
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '雷达图', label: '雷达图' },
                    { value: '饼图', label: '饼图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '散点图', label: '散点图' },
                    { value: '树状图', label: '树状图' },
                    { value: '气泡图', label: '气泡图' },
                    { value: '极坐标图', label: '极坐标图' },
                    { value: '地图图', label: '地图图' },
                  ]}
                  placeholder={'请选择类型'}
                ></Select>
              </Form.Item>
              <Form.Item
                name="file" //后端指定了接收参数为file
                label="原始数据："
              >
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传excel文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                  智能分析
                </Button>
                <Button htmlType="reset">重置</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先进行智能分析</div>}
            <Spin spinning={submitting}/>
          </Card>

          <Divider />
          <Card title="可视化图表：">
            {
              //利用Echarts组件，让option存在则输出option对应的图表内容
              option ? <ReactECharts option={option} /> : <div>请先进行智能分析</div>
            }
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default addChart;
