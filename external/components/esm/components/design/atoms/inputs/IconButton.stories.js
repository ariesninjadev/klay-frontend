function _extends(){return _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_extends.apply(this,arguments)}import React from"react";import{Globe}from"@styled-icons/boxicons-regular";import{IconButton}from"./IconButton";export default{title:"Design System/Atoms/Inputs/Icon Button",component:IconButton,argTypes:{shape:{name:"Shape",control:"radio",options:["default","circle"],defaultValue:"default"}}};var Template=function(a){return React.createElement(IconButton,_extends({},a,{children:React.createElement(Globe,{size:32})}))};export var Normal=Template.bind({});export var Circle=Template.bind({});Circle.args={shape:"circle"};export var Rotated=Template.bind({});Rotated.args={rotate:"90deg"};