function _extends(){return _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_extends.apply(this,arguments)}import React from"react";import{AccountDetail}from"./AccountDetail";import{ContextDecorator,InjectMockClient}from"../../../../lib/internal";export default{title:"Pages/Settings/Account/Account Detail",component:AccountDetail,decorators:[ContextDecorator],argTypes:{user:{type:"symbol"}}};export var Default=function(a){return React.createElement(InjectMockClient,null,function(b){var c=b.client;return React.createElement(AccountDetail,_extends({},a,{user:c.user}))})};