import React from"react";import{Initials}from"./Initials";import{MaskDecorator}from"../../../../lib/internal";export default{title:"Design System/Atoms/Display/Initials",component:Initials,argTypes:{input:{name:"Input String",defaultValue:"John Smith"},maxLength:{name:"Max Length"}},decorators:[MaskDecorator]};var Template=function(a){return React.createElement(Initials,a)};export var Default=Template.bind({});