import {Layout} from "antd";

export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' },
      { name: '注册', path: '/user/register', component: './User/Register'}
    ],
  },

  { path: '/', redirect: '/addChart' },
  { path: '/addChart', name: '智能分析', icon: 'barChart', component: './AddChart' },
  { path: '/addChartAsync/', name: '异步分析', icon: 'lineChart', component: './AddChartAsync' },
  { path: '/addChartAsyncMq/', name: 'MQ分析', icon: 'dotChart', component: './AddChartAsyncMq' },
  { path: '/myChart', name: '图表管理', icon: 'pieChart', component: './MyChart' },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '二级管理页', component: './Admin' },
    ],
  },
  { path: '*', layout: false, component: './404' },
];
