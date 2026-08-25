(()=>{var e={};e.id=6833,e.ids=[6833],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},25528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},39491:e=>{"use strict";e.exports=require("assert")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},85158:e=>{"use strict";e.exports=require("http2")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},17053:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>i.a,__next_app__:()=>p,originalPathname:()=>d,pages:()=>c,routeModule:()=>y,tree:()=>u});var r=s(50482),n=s(69108),a=s(62563),i=s.n(a),o=s(68300),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);s.d(t,l);let u=["",{children:["business",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,6107)),"C:\\Users\\Lenovo\\OneDrive\\Documents\\GSDF NGO\\Company dashboard\\frontend\\app\\business\\page.jsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,84544)),"C:\\Users\\Lenovo\\OneDrive\\Documents\\GSDF NGO\\Company dashboard\\frontend\\app\\business\\layout.js"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,93384)),"C:\\Users\\Lenovo\\OneDrive\\Documents\\GSDF NGO\\Company dashboard\\frontend\\app\\layout.js"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,69361,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Users\\Lenovo\\OneDrive\\Documents\\GSDF NGO\\Company dashboard\\frontend\\app\\business\\page.jsx"],d="/business/page",p={require:s,loadChunk:()=>Promise.resolve()},y=new r.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/business/page",pathname:"/business",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:u}})},70340:(e,t,s)=>{Promise.resolve().then(s.bind(s,56390))},56390:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>u});var r=s(95344),n=s(3729),a=s(22254),i=s(55673),o=s(55794),l=s(68219);function u(){let e=(0,a.useRouter)(),[t,s]=(0,n.useState)({attendanceThisMonth:0,activeProjects:0,pendingTasks:0,completedTasks:0}),[u,c]=(0,n.useState)(!0);(0,n.useEffect)(()=>{if(!localStorage.getItem("user")){e.push("/login");return}d()},[e]);let d=async()=>{try{let e=new Date,t=new Date(e.getFullYear(),e.getMonth(),1),[r,n]=await Promise.all([i.h.get(`/attendance/me?startDate=${t.toISOString()}&endDate=${e.toISOString()}`),i.h.get("/projects")]),a=r.data.attendances||[],o=a.filter(e=>"PRESENT"===e.status||"LATE"===e.status).length;s({attendanceThisMonth:a.length>0?Math.round(o/a.length*100):0,activeProjects:n.data.projects?.filter(e=>"IN_PROGRESS"===e.status).length||0,pendingTasks:0,completedTasks:0})}catch(e){console.error("Error fetching dashboard data:",e)}finally{c(!1)}};return u?r.jsx("div",{className:"flex items-center justify-center h-64",children:r.jsx("div",{className:"text-muted",children:"Loading..."})}):(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("div",{children:[r.jsx("h1",{className:"text-3xl font-bold text-offwhite",children:"Welcome back!"}),r.jsx("p",{className:"text-muted mt-1",children:"Here's what's happening with your business management tasks today."})]}),r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[{label:"My Attendance This Month",value:`${t.attendanceThisMonth}%`,icon:o.Z,color:"text-teal"},{label:"Active Projects",value:t.activeProjects,icon:l.Z,color:"text-teal"},{label:"Pending Tasks",value:t.pendingTasks,icon:l.Z,color:"text-orange"},{label:"Completed Tasks",value:t.completedTasks,icon:l.Z,color:"text-teal"}].map((e,t)=>r.jsx("div",{className:"card",children:(0,r.jsxs)("div",{className:"flex items-center justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-muted text-sm",children:e.label}),r.jsx("p",{className:`text-3xl font-bold mt-2 ${e.color}`,children:e.value})]}),r.jsx(e.icon,{size:32,className:e.color})]})},t))})]})}s(44669)},69224:(e,t,s)=>{"use strict";s.d(t,{Z:()=>i});var r=s(3729),n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),i=(e,t)=>{let s=(0,r.forwardRef)(({color:s="currentColor",size:i=24,strokeWidth:o=2,absoluteStrokeWidth:l,className:u="",children:c,...d},p)=>(0,r.createElement)("svg",{ref:p,...n,width:i,height:i,stroke:s,strokeWidth:l?24*Number(o)/Number(i):o,className:["lucide",`lucide-${a(e)}`,u].join(" "),...d},[...t.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(c)?c:[c]]));return s.displayName=`${e}`,s}},33037:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},38330:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("CalendarCheck",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}],["path",{d:"m9 16 2 2 4-4",key:"19s6y9"}]])},80958:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("CalendarDays",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]])},55794:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]])},25390:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},68219:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("FolderOpen",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]])},2273:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},48120:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},98200:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},38852:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]])},18822:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},14513:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(69224).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},22254:(e,t,s)=>{e.exports=s(14767)},30080:(e,t,s)=>{"use strict";/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r=s(3729);"function"==typeof Object.is&&Object.is,r.useState,r.useEffect,r.useLayoutEffect,r.useDebugValue,t.useSyncExternalStore=void 0!==r.useSyncExternalStore?r.useSyncExternalStore:function(e,t){return t()}},27986:(e,t,s)=>{"use strict";/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r=s(3729),n=s(8145),a="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=n.useSyncExternalStore,o=r.useRef,l=r.useEffect,u=r.useMemo,c=r.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,s,r,n){var d=o(null);if(null===d.current){var p={hasValue:!1,value:null};d.current=p}else p=d.current;var y=i(e,(d=u(function(){function e(e){if(!l){if(l=!0,i=e,e=r(e),void 0!==n&&p.hasValue){var t=p.value;if(n(t,e))return o=t}return o=e}if(t=o,a(i,e))return t;var s=r(e);return void 0!==n&&n(t,s)?(i=e,t):(i=e,o=s)}var i,o,l=!1,u=void 0===s?null:s;return[function(){return e(t())},null===u?void 0:function(){return e(u())}]},[t,s,r,n]))[0],d[1]);return l(function(){p.hasValue=!0,p.value=y},[y]),c(y),y}},8145:(e,t,s)=>{"use strict";e.exports=s(30080)},34657:(e,t,s)=>{"use strict";e.exports=s(27986)},6107:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$typeof:()=>a,__esModule:()=>n,default:()=>i});let r=(0,s(86843).createProxy)(String.raw`C:\Users\Lenovo\OneDrive\Documents\GSDF NGO\Company dashboard\frontend\app\business\page.jsx`),{__esModule:n,$$typeof:a}=r,i=r.default},43158:(e,t,s)=>{"use strict";s.d(t,{Ue:()=>p});let r=e=>{let t;let s=new Set,r=(e,r)=>{let n="function"==typeof e?e(t):e;if(!Object.is(n,t)){let e=t;t=(null!=r?r:"object"!=typeof n||null===n)?n:Object.assign({},t,n),s.forEach(s=>s(t,e))}},n=()=>t,a={setState:r,getState:n,getInitialState:()=>i,subscribe:e=>(s.add(e),()=>s.delete(e)),destroy:()=>{console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),s.clear()}},i=t=e(r,n,a);return a},n=e=>e?r(e):r;var a=s(3729),i=s(34657);let{useDebugValue:o}=a,{useSyncExternalStoreWithSelector:l}=i,u=!1,c=e=>e,d=e=>{"function"!=typeof e&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");let t="function"==typeof e?n(e):e,s=(e,s)=>(function(e,t=c,s){s&&!u&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),u=!0);let r=l(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,s);return o(r),r})(t,e,s);return Object.assign(s,t),s},p=e=>e?d(e):d}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[2404,8221,4965],()=>s(17053));module.exports=r})();