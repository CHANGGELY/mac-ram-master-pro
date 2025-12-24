import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * [Mentor Note]
 * 这是网页版“办公大厅”的入口。
 * 我们在这里把 React 编写的精美组件真正“挂载”到页面的 DOM 节点上。
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
