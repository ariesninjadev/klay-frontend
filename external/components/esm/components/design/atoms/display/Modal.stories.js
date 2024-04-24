function _extends(){return _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_extends.apply(this,arguments)}function _slicedToArray(a,b){return _arrayWithHoles(a)||_iterableToArrayLimit(a,b)||_unsupportedIterableToArray(a,b)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function _iterableToArrayLimit(a,b){var c=null==a?null:"undefined"!=typeof Symbol&&a[Symbol.iterator]||a["@@iterator"];if(null!=c){var d,e,f=[],g=!0,h=!1;try{for(c=c.call(a);!(g=(d=c.next()).done)&&(f.push(d.value),!(b&&f.length===b));g=!0);}catch(a){h=!0,e=a}finally{try{g||null==c["return"]||c["return"]()}finally{if(h)throw e}}return f}}function _arrayWithHoles(a){if(Array.isArray(a))return a}import React from"react";import{useArgs}from"@storybook/client-api";import{Modal}from"./Modal";export default{title:"Design System/Atoms/Display/Modal",component:Modal,argTypes:{open:{name:"Open",type:"boolean",defaultValue:!0},children:{name:"Content",type:"string",defaultValue:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."},title:{name:"Title",type:"string",defaultValue:"Modal Title"},description:{name:"Description",type:"string",defaultValue:"Optional modal description."},padding:{name:"Padding",type:"string",defaultValue:void 0},maxWidth:{name:"Max Width",type:"string",defaultValue:void 0},actions:{name:"Actions",defaultValue:[{children:"OK",palette:"accent",confirmation:!0},{children:"Cancel",palette:"plain"}]},transparent:{name:"Transparent",type:"boolean",defaultValue:!1},disabled:{name:"Disabled",type:"boolean",defaultValue:!1},nonDismissable:{name:"Non-dismissable",type:"boolean",defaultValue:!1}}};var Template=function(a){var b=useArgs(),c=_slicedToArray(b,2),d=c[0],f=c[1];return a.open?React.createElement(Modal,_extends({},a,{onClose:function onClose(){return f({open:!1})},registerOnClose:function registerOnClose(a){var b=function(b){return"Escape"===b.key&&a()};return document.addEventListener("keyup",b),function(){return document.removeEventListener("keyup",b)}},registerOnConfirm:function registerOnConfirm(a){var b=function(b){"Enter"===b.key&&(a(),f({disabled:!0}),setTimeout(close,1e3))};return document.addEventListener("keyup",b),function(){return document.removeEventListener("keyup",b)}}})):React.createElement(React.Fragment,null)};export var Default=Template.bind({});export var NoActions=Template.bind({});NoActions.args={actions:void 0,description:void 0,children:"This modal does not have any actions!"};