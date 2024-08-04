import {Button, Card, Form, Input, message, Select, Upload,} from 'antd';
import React, {useState} from 'react';
import {genChartByAiAsyncMqUsingPost, genChartByAiAsyncUsingPost} from "@/services/zoubi/biChartController";
import {useForm} from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import {UploadOutlined} from "@ant-design/icons";


/**
 * 添加图表(异步)
 */

const addChartAsyncMq: React.FC = () => {
  const [form]= useForm();  //操作表单的语法
  // 定义提交时的加载效果，默认未提交
  const[submitting,setSubmitting]= useState<boolean>(false);

  const onFinish = async (values: any) => {
    //避免重复提交
    if(submitting){
      return;
    }
    setSubmitting(true); //开始提交

    //对接后端上传数据
    const params={       //表示除了file的请求参数
      ...values,
      file:undefined
    }
    try{
      //传入前端请求致，异步拿到后端返回值
      //核心点：前端上传的file经过调试发现其里面还有一层才能取到excel数据,具体看图
      const res= await genChartByAiAsyncMqUsingPost(params,{},values.file.file.originFileObj)
      if(!res?.data){          // 如果 res 为空或 data 不存在，则认为失败
        message.error('分析失败')
      }else{
        message.success('分析任务提交成功，稍后请在我的图表页面')
        form.resetFields();     //重置表单
      }
    }catch (e:any){
      message.error('分析失败'+e.message);
    }
    setSubmitting(false); //结束提交
  };

  return (
    <div className="addChartAsync">
          <Card title="MQ分析">
            <Form form={form}
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
                  点击提交
                </Button>
                <Button htmlType="reset">重置</Button>
              </Form.Item>
            </Form>
          </Card>
    </div>
  );
};
export default addChartAsyncMq;
