(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const P="listago_tasks",M="listago_projects",N=[{id:"proj-work-sprint",name:"Work Sprint",color:"#6366f1",icon:"fas fa-rocket",createdAt:new Date().toISOString()},{id:"proj-design-system",name:"Design System",color:"#ec4899",icon:"fas fa-palette",createdAt:new Date().toISOString()},{id:"proj-personal-goals",name:"Personal Goals",color:"#10b981",icon:"fas fa-bullseye",createdAt:new Date().toISOString()}],L={getTasks(){try{const s=localStorage.getItem(P);if(s!==null){const e=JSON.parse(s);if(Array.isArray(e)){if(!localStorage.getItem("listago_hardcoded_cleaned_v2")){const t=["Review Q3 Security Audit","Design interactive Glassmorphism cards","Prepare presentation deck","Complete 5km morning run","Refactor state management","Weekly grocery shopping"],n=e.filter(i=>!t.some(a=>i.title&&i.title.includes(a)));return this.saveTasks(n),localStorage.setItem("listago_hardcoded_cleaned_v2","true"),n}return e}}}catch(s){console.warn("Failed to parse tasks from localStorage:",s)}return[]},saveTasks(s){try{return localStorage.setItem(P,JSON.stringify(s)),!0}catch(e){return console.error("Storage quota exceeded or unavailable:",e),!1}},getProjects(){try{const s=localStorage.getItem(M);if(s)return JSON.parse(s)}catch(s){console.warn("Failed to parse projects from localStorage:",s)}return this.saveProjects(N),N},saveProjects(s){try{return localStorage.setItem(M,JSON.stringify(s)),!0}catch(e){return console.error("Failed to save projects to localStorage:",e),!1}}};function E(s){if(!s)return"";const e=document.createElement("div");return e.textContent=s,e.innerHTML}function _(s){return s?/<\/?[a-z][\s\S]*>/i.test(s):!1}function C(s){if(!s)return"";const e=s.trim();if(!e)return"";if(_(e))return R(e);const t=e.split(/\r?\n/);let n="",i=!1,a=!1;const r=()=>{i&&(n+="</ul>",i=!1),a&&(n+="</ol>",a=!1)};for(let o=0;o<t.length;o++){const c=t[o].trim();if(!c){r();continue}const d=c.match(/^([*\-•+])\s+(.*)$/);if(d){a&&(n+="</ol>",a=!1),i||(n+='<ul class="task-bullets-list">',i=!0),n+=`<li>${D(d[2])}</li>`;continue}const u=c.match(/^(\d+)[\.\)]\s+(.*)$/);if(u){i&&(n+="</ul>",i=!1),a||(n+='<ol class="task-numbers-list">',a=!0),n+=`<li>${D(u[2])}</li>`;continue}r(),n+=`<p class="task-content-line">${D(c)}</p>`}return r(),n}function D(s){if(!s)return"";let e=E(s);return e=e.replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>'),e=e.replace(/(\*\*|__)(.*?)\1/g,"<strong>$2</strong>"),e=e.replace(/(\*|_)(.*?)\1/g,"<em>$2</em>"),e=e.replace(/~~(.*?)~~/g,"<del>$1</del>"),e}function R(s){if(!s)return"";const t=new DOMParser().parseFromString(s,"text/html");return["script","style","iframe","object","embed","form","input","button","link","meta"].forEach(a=>{t.querySelectorAll(a).forEach(r=>r.remove())}),t.body.querySelectorAll("*").forEach(a=>{Array.from(a.attributes).forEach(r=>{const o=r.name.toLowerCase(),l=r.value.toLowerCase();(o.startsWith("on")||l.includes("javascript:")||l.includes("data:text/html"))&&a.removeAttribute(r.name)}),a.tagName==="UL"&&a.classList.add("task-bullets-list"),a.tagName==="OL"&&a.classList.add("task-numbers-list")}),t.body.innerHTML}function U(s,e){const t=s&&(s.includes(`
`)||s.length>80),n=!!(e&&e.trim()&&e.trim()!=="<br>");return!!(t||n)}function O(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(s){const e=Math.random()*16|0;return(s==="x"?e:e&3|8).toString(16)})}function S(){const s=new Date,e=s.getFullYear(),t=String(s.getMonth()+1).padStart(2,"0"),n=String(s.getDate()).padStart(2,"0");return`${e}-${t}-${n}`}function V(s){if(!s)return"";const[e,t,n]=s.split("-").map(Number);if(!e||!t||!n)return s;const i=new Date(e,t-1,n),a=S();if(s===a)return"Today";const r=new Date;r.setDate(r.getDate()+1);const o=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`;if(s===o)return"Tomorrow";const l=new Date;l.setDate(l.getDate()-1);const c=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`;return s===c?"Yesterday":i.toLocaleDateString(void 0,{month:"short",day:"numeric",year:i.getFullYear()!==new Date().getFullYear()?"numeric":void 0})}function x(s){if(!s)return!1;const e=S();return s<e}function B(s){return s?s===S():!1}function A(s){if(!s)return!1;const e=S();if(s<=e)return!1;const[t,n,i]=s.split("-").map(Number),a=new Date(t,n-1,i),r=new Date,o=new Date;return o.setDate(r.getDate()+7),o.setHours(23,59,59,999),a<=o}class z{constructor(){this.container=null}init(){this.container=document.getElementById("toast-container"),this.container||(this.container=document.createElement("div"),this.container.id="toast-container",document.body.appendChild(this.container))}show(e,t="info",n=3e3){this.container||this.init();const i=document.createElement("div");i.className=`toast toast-${t}`;let a="fas fa-info-circle";t==="success"&&(a="fas fa-check-circle"),t==="error"&&(a="fas fa-exclamation-triangle"),t==="warning"&&(a="fas fa-exclamation-circle"),i.innerHTML=`
      <i class="${a} toast-icon"></i>
      <div class="toast-message">${e}</div>
    `,this.container.appendChild(i),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateX(50px)",setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},300)},n)}success(e,t){this.show(e,"success",t)}error(e,t){this.show(e,"error",t)}info(e,t){this.show(e,"info",t)}warning(e,t){this.show(e,"warning",t)}}const f=new z,q={id:"inbox",name:"Inbox",color:"#6366f1",icon:"fas fa-inbox",isDefault:!0},$=["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#10b981","#06b6d4","#3b82f6","#84cc16"],j=["fas fa-folder","fas fa-rocket","fas fa-briefcase","fas fa-code","fas fa-palette","fas fa-bullseye","fas fa-star","fas fa-heart","fas fa-bookmark","fas fa-graduation-cap","fas fa-layer-group","fas fa-lightbulb"];class Q{constructor(){this.projects=[],this.listeners=[]}init(){this.projects=L.getProjects()}onChange(e){this.listeners.push(e)}notify(){L.saveProjects(this.projects),this.listeners.forEach(e=>e(this.getProjects()))}getProjects(){return this.projects}getProjectById(e){return!e||e==="inbox"?q:this.projects.find(t=>t.id===e)||q}addProject({name:e,color:t,icon:n}){const i=(e||"").trim();if(!i)return f.error("Project name cannot be empty"),null;if(i.length>50)return f.error("Project name cannot exceed 50 characters"),null;if(this.projects.some(o=>o.name.toLowerCase()===i.toLowerCase())||i.toLowerCase()==="inbox")return f.error(`Project "${i}" already exists`),null;const r={id:O(),name:i,color:t||$[0],icon:n||j[0],createdAt:new Date().toISOString()};return this.projects.push(r),this.notify(),f.success(`Project "${r.name}" created`),r}deleteProject(e){const t=this.projects.find(n=>n.id===e);return t?(this.projects=this.projects.filter(n=>n.id!==e),this.notify(),f.info(`Project "${t.name}" deleted`),!0):!1}}const b=new Q,k=5e3;class Y{constructor(){this.tasks=[],this.listeners=[]}init(){this.tasks=L.getTasks()}onChange(e){this.listeners.push(e)}notify(){L.saveTasks(this.tasks),this.listeners.forEach(e=>e(this.tasks))}getTasks(){return this.tasks}getTaskById(e){return this.tasks.find(t=>t.id===e)}addTask({title:e,description:t="",projectId:n="inbox",priority:i="medium",status:a="todo",dueDate:r=null}){const o=(e||"").trim();if(!o)return f.error("Task title cannot be empty"),null;if(o.length>k)return f.error(`Task title cannot exceed ${k} characters`),null;this.tasks.find(u=>!u.completed&&u.title.toLowerCase()===o.toLowerCase()&&(u.projectId||"inbox")===(n||"inbox"))&&f.warning("A task with this title already exists in this project");const c=a==="done",d={id:O(),title:o,text:o,description:t.trim(),completed:c,createdAt:new Date().toISOString(),dueDate:r||null,createdDate:new Date().toDateString(),projectId:n||"inbox",priority:i||"medium",status:a||"todo"};return this.tasks.unshift(d),this.notify(),f.success("Task created successfully"),d}updateTask(e,t){const n=this.tasks.findIndex(i=>i.id===e);if(n===-1)return null;if(t.title){const i=t.title.trim();if(!i)return f.error("Task title cannot be empty"),null;if(i.length>k)return f.error(`Task title cannot exceed ${k} characters`),null;t.title=i,t.text=i}return t.status!==void 0?t.completed=t.status==="done":t.completed!==void 0&&(t.status=t.completed?"done":"todo"),this.tasks[n]={...this.tasks[n],...t},this.notify(),f.success("Task updated"),this.tasks[n]}toggleComplete(e){const t=this.getTaskById(e);if(!t)return;const n=!t.completed,i=n?"done":"todo";this.updateTask(e,{completed:n,status:i}),n&&f.success("Task marked as completed")}deleteTask(e){return this.getTaskById(e)?(this.tasks=this.tasks.filter(n=>n.id!==e),this.notify(),f.info("Task deleted"),!0):!1}deleteTasks(e){if(!e||!e.length)return 0;const t=this.tasks.length,n=new Set(e);this.tasks=this.tasks.filter(a=>!n.has(a.id));const i=t-this.tasks.length;return this.notify(),f.info(`Deleted ${i} tasks`),i}clearCompleted(){const e=this.tasks.filter(t=>t.completed).length;return e===0?(f.info("No completed tasks to clear"),0):(this.tasks=this.tasks.filter(t=>!t.completed),this.notify(),f.info(`Cleared ${e} completed tasks`),e)}moveTasksToInbox(e){let t=0;return this.tasks=this.tasks.map(n=>n.projectId===e?(t++,{...n,projectId:"inbox"}):n),this.notify(),t}deleteTasksByProject(e){const t=this.tasks.length;this.tasks=this.tasks.filter(i=>i.projectId!==e);const n=t-this.tasks.length;return this.notify(),n}getStats(){const e=this.tasks.length,t=this.tasks.filter(o=>o.completed).length,n=e-t,i=this.tasks.filter(o=>!o.completed&&o.dueDate&&x(o.dueDate)).length,a=this.tasks.filter(o=>!o.completed&&o.dueDate&&B(o.dueDate)).length,r=this.tasks.filter(o=>!o.completed&&o.dueDate&&A(o.dueDate)).length;return{total:e,pending:n,completed:t,overdue:i,today:a,upcoming:r,completionRate:e>0?Math.round(t/e*100):0}}filterTasks({view:e="all",projectId:t=null,status:n="all",priority:i="all",search:a="",sortBy:r="dueDate"}={}){let o=[...this.tasks];if(e==="today"?o=o.filter(c=>c.dueDate&&B(c.dueDate)):e==="upcoming"?o=o.filter(c=>c.dueDate&&A(c.dueDate)):e==="overdue"?o=o.filter(c=>!c.completed&&c.dueDate&&x(c.dueDate)):e==="completed"?o=o.filter(c=>c.completed):e==="project"&&t&&(o=o.filter(c=>(c.projectId||"inbox")===t)),n&&n!=="all"&&(n==="active"?o=o.filter(c=>!c.completed):n==="completed"?o=o.filter(c=>c.completed):o=o.filter(c=>c.status===n)),i&&i!=="all"&&(o=o.filter(c=>c.priority===i)),a&&a.trim()){const c=a.toLowerCase().trim();o=o.filter(d=>{const u=d.title.toLowerCase().includes(c),g=(d.description||"").toLowerCase().includes(c);return u||g})}const l={urgent:4,high:3,medium:2,low:1};return o.sort((c,d)=>c.completed!==d.completed?c.completed?1:-1:r==="dueDate"?!c.dueDate&&!d.dueDate?0:c.dueDate?d.dueDate?c.dueDate.localeCompare(d.dueDate):-1:1:r==="priority"?(l[d.priority]||0)-(l[c.priority]||0):r==="title"?c.title.localeCompare(d.title):r==="created"?new Date(d.createdAt)-new Date(c.createdAt):0),o}}const m=new Y,h={activeModal:null,open(s){const e=document.getElementById(s);e&&(e.classList.add("active"),this.activeModal=e,document.body.style.overflow="hidden")},close(s){const e=s?document.getElementById(s):this.activeModal;e&&(e.classList.remove("active"),this.activeModal===e&&(this.activeModal=null)),document.querySelector(".modal-overlay.active")||(document.body.style.overflow="")},closeAll(){document.querySelectorAll(".modal-overlay.active").forEach(s=>{s.classList.remove("active")}),this.activeModal=null,document.body.style.overflow=""},confirmDeleteTask(s){const e=m.getTaskById(s);if(!e)return;document.getElementById("delete-modal");const t=document.getElementById("delete-task-title-preview"),n=document.getElementById("delete-confirm-btn");if(t&&(t.innerHTML=`<strong>"${E(e.title)}"</strong>`),n){const i=n.cloneNode(!0);n.parentNode.replaceChild(i,n),i.addEventListener("click",()=>{m.deleteTask(s),this.close("delete-modal")})}this.open("delete-modal")},confirmBulkDelete(s,e){if(!s||!s.length)return;document.getElementById("bulk-delete-modal");const t=document.getElementById("bulk-delete-desc"),n=document.getElementById("bulk-delete-confirm-btn");if(t&&(t.textContent=`Are you sure you want to permanently delete ${s.length} selected task${s.length>1?"s":""}? This action cannot be undone.`),n){const i=n.cloneNode(!0);n.parentNode.replaceChild(i,n),i.addEventListener("click",()=>{m.deleteTasks(s),this.close("bulk-delete-modal"),e&&e()})}this.open("bulk-delete-modal")},confirmClearCompleted(){const s=m.getTasks().filter(t=>t.completed);if(s.length===0)return;const e=s.map(t=>t.id);this.confirmBulkDelete(e,null)},init(){document.querySelectorAll(".modal-overlay").forEach(s=>{s.addEventListener("click",e=>{e.target===s&&this.close(s.id)})}),document.querySelectorAll("[data-close-modal]").forEach(s=>{s.addEventListener("click",e=>{const t=s.getAttribute("data-close-modal");this.close(t)})}),window.addEventListener("keydown",s=>{s.key==="Escape"&&this.closeAll()})}},H={selectedColor:$[0],selectedIcon:j[0],init(){this.setupColorPicker(),this.setupIconPicker(),this.setupForm(),this.setupDeleteModal()},setupColorPicker(){const s=document.getElementById("project-color-picker");s&&(s.innerHTML="",$.forEach((e,t)=>{const n=document.createElement("div");n.className=`color-option ${t===0?"selected":""}`,n.style.backgroundColor=e,n.setAttribute("data-color",e),n.addEventListener("click",()=>{s.querySelectorAll(".color-option").forEach(i=>i.classList.remove("selected")),n.classList.add("selected"),this.selectedColor=e}),s.appendChild(n)}))},setupIconPicker(){const s=document.getElementById("project-icon-picker");s&&(s.innerHTML="",j.forEach((e,t)=>{const n=document.createElement("div");n.className=`icon-option ${t===0?"selected":""}`,n.innerHTML=`<i class="${e}"></i>`,n.setAttribute("data-icon",e),n.addEventListener("click",()=>{s.querySelectorAll(".icon-option").forEach(i=>i.classList.remove("selected")),n.classList.add("selected"),this.selectedIcon=e}),s.appendChild(n)}))},setupForm(){const s=document.getElementById("project-create-form"),e=document.getElementById("project-name-input"),t=document.getElementById("project-name-counter");e&&t&&e.addEventListener("input",()=>{t.textContent=`${e.value.length}/50`}),s&&s.addEventListener("submit",i=>{i.preventDefault();const a=e.value;b.addProject({name:a,color:this.selectedColor,icon:this.selectedIcon})&&(s.reset(),t&&(t.textContent="0/50"),h.close("project-modal"))});const n=document.getElementById("btn-new-project");n&&n.addEventListener("click",()=>{s&&s.reset(),this.selectedColor=$[0],this.selectedIcon=j[0],this.setupColorPicker(),this.setupIconPicker(),t&&(t.textContent="0/50"),h.open("project-modal"),setTimeout(()=>e&&e.focus(),100)})},openDeleteDialog(s){const e=b.getProjectById(s);if(!e||e.isDefault)return;document.getElementById("delete-project-modal");const t=document.getElementById("delete-project-name-preview"),n=document.getElementById("delete-project-task-count"),i=document.getElementById("delete-project-confirm-btn"),a=document.getElementById("delete-project-action-select"),r=m.getTasks().filter(o=>o.projectId===s);if(t&&(t.textContent=e.name),n&&(n.textContent=`${r.length} task${r.length!==1?"s":""}`),i){const o=i.cloneNode(!0);i.parentNode.replaceChild(o,i),o.addEventListener("click",()=>{(a?a.value:"move")==="move"?m.moveTasksToInbox(s):m.deleteTasksByProject(s),b.deleteProject(s),h.close("delete-project-modal")})}h.open("delete-project-modal")},setupDeleteModal(){}},I={mode:"create",editingTaskId:null,init(){this.setupToolbar(),this.setupForm(),this.setupQuickDateButtons()},setupToolbar(){const s=document.getElementById("task-description-editor");s&&(document.querySelectorAll(".toolbar-btn[data-command]").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const n=e.getAttribute("data-command"),i=e.getAttribute("data-value")||null;s.focus(),document.execCommand(n,!1,i),this.updateToolbarState()})}),s.addEventListener("keyup",()=>this.updateToolbarState()),s.addEventListener("mouseup",()=>this.updateToolbarState()))},updateToolbarState(){document.querySelectorAll(".toolbar-btn[data-command]").forEach(s=>{const e=s.getAttribute("data-command");try{document.queryCommandState(e)?s.classList.add("active"):s.classList.remove("active")}catch{}})},populateProjectSelect(s="inbox"){const e=document.getElementById("task-form-project");if(!e)return;e.innerHTML='<option value="inbox">📥 Inbox (General)</option>',b.getProjects().forEach(n=>{const i=document.createElement("option");i.value=n.id,i.textContent=`${n.name}`,n.id===s&&(i.selected=!0),e.appendChild(i)})},setupQuickDateButtons(){const s=document.getElementById("task-form-duedate");if(!s)return;const e=r=>{const o=new Date;o.setDate(o.getDate()+r);const l=o.getFullYear(),c=String(o.getMonth()+1).padStart(2,"0"),d=String(o.getDate()).padStart(2,"0");s.value=`${l}-${c}-${d}`},t=document.getElementById("date-btn-today"),n=document.getElementById("date-btn-tomorrow"),i=document.getElementById("date-btn-next-week"),a=document.getElementById("date-btn-clear");t&&t.addEventListener("click",()=>e(0)),n&&n.addEventListener("click",()=>e(1)),i&&i.addEventListener("click",()=>e(7)),a&&a.addEventListener("click",()=>s.value="")},setupForm(){const s=document.getElementById("task-form"),e=document.getElementById("task-form-title"),t=document.getElementById("task-form-counter"),n=document.getElementById("task-description-editor");document.getElementById("task-modal-title"),document.getElementById("task-submit-btn-text");const i=document.getElementById("modal-add-bullet-btn"),a=document.getElementById("modal-add-number-btn"),r=l=>{if(!e)return;e.focus();const c=e.selectionStart,d=e.selectionEnd,u=e.value,p=c>0&&u[c-1]!==`
`?`
${l}`:l;e.value=u.substring(0,c)+p+u.substring(d),e.selectionStart=e.selectionEnd=c+p.length,t&&(t.textContent=`${e.value.length}/${k}`)};i&&i.addEventListener("click",()=>r("- ")),a&&a.addEventListener("click",()=>r("1. ")),e&&e.addEventListener("keydown",l=>{if(l.key==="Enter"){const c=e.selectionStart,d=e.value.substring(0,c),u=d.split(`
`).pop(),g=u.match(/^([*\-•+])\s+(.*)$/),p=u.match(/^(\d+)[\.\)]\s+(.*)$/);if(g&&g[2].trim()){l.preventDefault();const v=`
${g[1]} `,y=e.value.substring(c);e.value=d+v+y,e.selectionStart=e.selectionEnd=c+v.length,t&&(t.textContent=`${e.value.length}/${k}`)}else if(p&&p[2].trim()){l.preventDefault();const y=`
${parseInt(p[1],10)+1}. `,T=e.value.substring(c);e.value=d+y+T,e.selectionStart=e.selectionEnd=c+y.length,t&&(t.textContent=`${e.value.length}/${k}`)}}}),e&&t&&e.addEventListener("input",()=>{t.textContent=`${e.value.length}/${k}`,e.value.length>k?t.style.color="#ef4444":t.style.color=""}),s&&s.addEventListener("submit",l=>{l.preventDefault();const c=e.value.trim(),d=n.innerHTML==="<br>"?"":n.innerHTML,u=document.getElementById("task-form-project").value,g=document.getElementById("task-form-status").value,p=document.getElementById("task-form-duedate").value||null,v=document.querySelector('input[name="task-priority"]:checked'),y=v?v.value:"medium";if(!c){e.focus();return}this.mode==="create"?m.addTask({title:c,description:d,projectId:u,status:g,priority:y,dueDate:p})&&(h.close("task-modal"),s.reset(),n.innerHTML=""):this.mode==="edit"&&this.editingTaskId&&m.updateTask(this.editingTaskId,{title:c,description:d,projectId:u,status:g,priority:y,dueDate:p})&&(h.close("task-modal"),s.reset(),n.innerHTML="")});const o=document.getElementById("btn-header-new-task");o&&o.addEventListener("click",()=>this.openCreate())},openCreate(s={}){this.mode="create",this.editingTaskId=null;const e=document.getElementById("task-modal-title"),t=document.getElementById("task-submit-btn-text"),n=document.getElementById("task-form"),i=document.getElementById("task-description-editor"),a=document.getElementById("task-form-counter"),r=document.getElementById("task-form-title");if(e&&(e.innerHTML='<i class="fas fa-plus-circle"></i> Create Jira-Style Task'),t&&(t.textContent="Create Task"),n&&n.reset(),i&&(i.innerHTML=""),a&&(a.textContent=`0/${k}`),this.populateProjectSelect(s.projectId||"inbox"),s.dueDate){const l=document.getElementById("task-form-duedate");l&&(l.value=s.dueDate)}if(s.status){const l=document.getElementById("task-form-status");l&&(l.value=s.status)}const o=document.querySelector('input[name="task-priority"][value="medium"]');o&&(o.checked=!0),h.open("task-modal"),setTimeout(()=>r&&r.focus(),100)},openEdit(s){const e=m.getTaskById(s);if(!e)return;this.mode="edit",this.editingTaskId=s;const t=document.getElementById("task-modal-title"),n=document.getElementById("task-submit-btn-text"),i=document.getElementById("task-form-title"),a=document.getElementById("task-description-editor"),r=document.getElementById("task-form-counter"),o=document.getElementById("task-form-status"),l=document.getElementById("task-form-duedate");t&&(t.innerHTML='<i class="fas fa-edit"></i> Edit Task Details'),n&&(n.textContent="Save Changes"),i&&(i.value=e.title,r&&(r.textContent=`${e.title.length}/${k}`)),a&&(a.innerHTML=e.description||""),this.populateProjectSelect(e.projectId||"inbox"),o&&(o.value=e.status||(e.completed?"done":"todo")),l&&(l.value=e.dueDate||"");const c=document.querySelector(`input[name="task-priority"][value="${e.priority||"medium"}"]`);c&&(c.checked=!0),h.open("task-modal"),setTimeout(()=>i&&i.focus(),100)}},G={render(s){const e=m.getStats(),t=m.getTasks();t.filter(o=>!o.completed&&o.dueDate&&x(o.dueDate));const n=t.filter(o=>!o.completed&&o.dueDate&&B(o.dueDate)),i=t.filter(o=>!o.completed&&o.dueDate&&A(o.dueDate)),a=[...t].slice(0,5),r=e.overdue>0?"has-overdue":"";s.innerHTML=`
      <div class="dashboard-container">
        <!-- Statistics Grid -->
        <div class="stats-grid">
          <div class="stat-card-compact total">
            <div class="stat-info">
              <span class="stat-label">Total Tasks</span>
              <span class="stat-number">${e.total}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-tasks"></i>
            </div>
          </div>

          <div class="stat-card-compact pending">
            <div class="stat-info">
              <span class="stat-label">Pending</span>
              <span class="stat-number">${e.pending}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-clock"></i>
            </div>
          </div>

          <div class="stat-card-compact completed">
            <div class="stat-info">
              <span class="stat-label">Completed</span>
              <span class="stat-number">${e.completed}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-check-double"></i>
            </div>
          </div>

          <div class="stat-card-compact overdue ${r}">
            <div class="stat-info">
              <span class="stat-label">Overdue</span>
              <span class="stat-number">${e.overdue}</span>
            </div>
            <div class="stat-icon-wrapper">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          </div>
        </div>

        <!-- Completion Progress Banner -->
        <div class="completion-banner">
          <div class="completion-header">
            <div class="completion-title">
              <i class="fas fa-chart-line" style="color: #818cf8;"></i>
              Sprint Velocity & Progress
            </div>
            <div class="completion-percentage">${e.completionRate}% Done</div>
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: ${e.completionRate}%;"></div>
          </div>
        </div>

        ${e.overdue>0?`
          <!-- Overdue Warning Alert -->
          <div class="overdue-alert-box">
            <div class="overdue-alert-left">
              <i class="fas fa-exclamation-circle"></i>
              <div>
                <strong>Attention Required:</strong> You have ${e.overdue} overdue task${e.overdue>1?"s":""} past deadline.
              </div>
            </div>
            <button class="btn-sm-danger" id="dashboard-resolve-overdue-btn">
              View Overdue Tasks
            </button>
          </div>
        `:""}

        <!-- Due Today Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-sun" style="color: #fbbf24;"></i>
              Due Today
              <span class="section-count-badge">${n.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="today">
              View All <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-today-list">
            ${n.length>0?n.map(o=>this.renderMiniTask(o)).join(""):`
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-glass-cheers" style="font-size: 1.5rem; color: #10b981;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No tasks due today</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">You are completely caught up for today!</div>
              </div>
            `}
          </div>
        </div>

        <!-- Upcoming (Next 7 Days) Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-calendar-week" style="color: #818cf8;"></i>
              Upcoming in Next 7 Days
              <span class="section-count-badge">${i.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="upcoming">
              View All <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-upcoming-list">
            ${i.length>0?i.map(o=>this.renderMiniTask(o)).join(""):`
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-calendar-check" style="font-size: 1.5rem; color: #818cf8;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No upcoming tasks</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">No tasks scheduled for the next 7 days.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Recent Tasks Overview -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-history" style="color: #a855f7;"></i>
              Recent Tasks
              <span class="section-count-badge">${a.length}</span>
            </div>
            <button class="section-action-btn" data-switch-view="all">
              View All Tasks <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="tasks-list" id="dashboard-recent-list">
            ${a.length>0?a.map(o=>this.renderMiniTask(o)).join(""):`
              <div class="empty-state" style="padding: 2rem 1rem;">
                <i class="fas fa-tasks" style="font-size: 1.5rem; color: #a855f7;"></i>
                <div class="empty-state-title" style="font-size: 1rem;">No tasks yet</div>
                <div class="empty-state-desc" style="font-size: 0.8rem;">Click '+ New Task' or use Quick Add to create your first task.</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `,this.attachEvents(s)},renderMiniTask(s){const e=b.getProjectById(s.projectId),t=s.dueDate?V(s.dueDate):null,n=!s.completed&&s.dueDate&&x(s.dueDate),i=!s.completed&&s.dueDate&&B(s.dueDate);let a="";n?a="overdue":i&&(a="today");const r=C(s.title);return`
      <div class="task-item ${s.completed?"completed":""}" data-task-id="${s.id}">
        <div class="task-left-section">
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${s.completed?"checked":""} data-action="toggle" data-id="${s.id}">
          </div>
          <div class="task-details" data-action="edit" data-id="${s.id}">
            <div class="task-title-formatted">${r}</div>
            <div class="task-meta-row">
              <span class="badge badge-priority-${s.priority}">
                <i class="fas fa-flag"></i> ${s.priority}
              </span>
              <span class="badge badge-status ${s.status}">
                ${s.status}
              </span>
              <span class="badge badge-project">
                <i class="${e.icon}" style="color: ${e.color}"></i> ${E(e.name)}
              </span>
              ${t?`
                <span class="badge-date ${a}">
                  <i class="fas fa-calendar-day"></i> ${t}
                </span>
              `:""}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn" title="Edit Task" data-action="edit" data-id="${s.id}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="task-btn delete" title="Delete Task" data-action="delete" data-id="${s.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `},attachEvents(s){s.querySelectorAll('[data-action="toggle"]').forEach(t=>{t.addEventListener("change",()=>{const n=t.getAttribute("data-id");m.toggleComplete(n)})}),s.querySelectorAll('[data-action="edit"]').forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-id");I.openEdit(n)})}),s.querySelectorAll('[data-action="delete"]').forEach(t=>{t.addEventListener("click",n=>{n.stopPropagation();const i=t.getAttribute("data-id");h.confirmDeleteTask(i)})}),s.querySelectorAll("[data-switch-view]").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-switch-view"),i=document.querySelector(`.nav-item[data-view="${n}"]`);i&&i.click()})});const e=s.querySelector("#dashboard-resolve-overdue-btn");e&&e.addEventListener("click",()=>{const t=document.querySelector('.nav-item[data-view="all"]');t&&t.click();const n=document.getElementById("view-filter-status");n&&(n.value="all");const i=document.getElementById("view-sort-by");i&&(i.value="dueDate")})}};class J{constructor(){this.currentView="dashboard",this.currentProjectId=null,this.currentStatusFilter="all",this.currentPriorityFilter="all",this.currentSortBy="dueDate",this.searchQuery="",this.selectedTaskIds=new Set,this.expandedTaskIds=new Set}init(){this.setupViewControls(),this.setupQuickAdd(),this.setupBulkActions(),this.setupSearch()}setupSearch(){const e=[document.getElementById("header-search-input"),document.getElementById("content-search-input")];e.forEach(t=>{t&&t.addEventListener("input",n=>{this.searchQuery=n.target.value,e.forEach(i=>{i&&i!==t&&(i.value=this.searchQuery)}),this.renderCurrentView()})})}setupViewControls(){document.querySelectorAll(".status-tab").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".status-tab").forEach(i=>i.classList.remove("active")),n.classList.add("active"),this.currentStatusFilter=n.getAttribute("data-status"),this.renderCurrentView()})});const e=document.getElementById("view-filter-priority");e&&e.addEventListener("change",n=>{this.currentPriorityFilter=n.target.value,this.renderCurrentView()});const t=document.getElementById("view-sort-by");t&&t.addEventListener("change",n=>{this.currentSortBy=n.target.value,this.renderCurrentView()})}setupQuickAdd(){const e=document.getElementById("quick-add-input"),t=document.getElementById("quick-add-priority"),n=document.getElementById("quick-add-project"),i=document.getElementById("quick-add-btn"),a=document.getElementById("quick-add-expand-btn"),r=document.getElementById("quick-add-bullet-btn"),o=()=>{if(!e)return;e.style.height="auto";const c=Math.min(Math.max(e.scrollHeight,28),160);e.style.height=`${c}px`};e&&e.addEventListener("input",o),r&&e&&r.addEventListener("click",()=>{e.focus();const c=e.selectionStart,d=e.selectionEnd,u=e.value,p=c>0&&u[c-1]!==`
`?`
- `:"- ";e.value=u.substring(0,c)+p+u.substring(d),e.selectionStart=e.selectionEnd=c+p.length,o()});const l=()=>{if(!e)return;const c=e.value.trim();if(!c){e.focus();return}const d=t?t.value:"medium",u=n?n.value:this.currentProjectId||"inbox";let g=null;if(this.currentView==="today"){const v=new Date;g=`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}-${String(v.getDate()).padStart(2,"0")}`}m.addTask({title:c,priority:d,projectId:u,dueDate:g,status:"todo"})&&(e.value="",e.style.height="auto",e.focus())};i&&i.addEventListener("click",l),e&&e.addEventListener("keydown",c=>{if(c.key==="Enter"&&!c.shiftKey)c.preventDefault(),l();else if(c.key==="Enter"&&c.shiftKey){const d=e.selectionStart,u=e.value.substring(0,d),g=u.split(`
`).pop(),p=g.match(/^([*\-•+])\s+(.*)$/),v=g.match(/^(\d+)[\.\)]\s+(.*)$/);if(p&&p[2].trim()){c.preventDefault();const y=`
${p[1]} `,T=e.value.substring(d);e.value=u+y+T,e.selectionStart=e.selectionEnd=d+y.length,o()}else if(v&&v[2].trim()){c.preventDefault();const T=`
${parseInt(v[1],10)+1}. `,F=e.value.substring(d);e.value=u+T+F,e.selectionStart=e.selectionEnd=d+T.length,o()}}}),a&&a.addEventListener("click",()=>{const c=e?e.value.trim():"";I.openCreate({title:c,projectId:this.currentProjectId||"inbox"})})}setupBulkActions(){const e=document.getElementById("bulk-delete-btn"),t=document.getElementById("bulk-cancel-btn"),n=document.getElementById("bulk-select-all-btn");e&&e.addEventListener("click",()=>{const i=Array.from(this.selectedTaskIds);h.confirmBulkDelete(i,()=>{this.selectedTaskIds.clear(),this.updateBulkActionBar()})}),t&&t.addEventListener("click",()=>{this.selectedTaskIds.clear(),this.updateBulkActionBar(),this.renderTaskListOnly()}),n&&n.addEventListener("click",()=>{this.getFilteredTasks().forEach(a=>this.selectedTaskIds.add(a.id)),this.updateBulkActionBar(),this.renderTaskListOnly()})}updateBulkActionBar(){const e=document.getElementById("bulk-actions-bar"),t=document.getElementById("bulk-selection-count");if(!e||!t)return;const n=this.selectedTaskIds.size;n>0?(e.classList.add("show"),t.textContent=`${n} task${n>1?"s":""} selected`):e.classList.remove("show")}setView(e,t=null){this.currentView=e,this.currentProjectId=t,this.selectedTaskIds.clear(),this.updateBulkActionBar(),this.renderCurrentView()}getFilteredTasks(){return m.filterTasks({view:this.currentView,projectId:this.currentProjectId,status:this.currentStatusFilter,priority:this.currentPriorityFilter,search:this.searchQuery,sortBy:this.currentSortBy})}renderCurrentView(){const e=document.getElementById("dashboard-view"),t=document.getElementById("tasks-view"),n=document.getElementById("view-header"),i=document.getElementById("view-controls-bar"),a=document.getElementById("quick-add-container");if(this.currentView==="dashboard"){e&&(e.style.display="block"),t&&(t.style.display="none"),n&&(n.style.display="none"),i&&(i.style.display="none"),a&&(a.style.display="none"),G.render(e);return}e&&(e.style.display="none"),t&&(t.style.display="block"),n&&(n.style.display="flex"),i&&(i.style.display="flex"),a&&(a.style.display="flex"),this.renderViewHeader(),this.populateQuickAddProjects(),this.renderTaskListOnly()}populateQuickAddProjects(){const e=document.getElementById("quick-add-project");if(!e)return;e.innerHTML='<option value="inbox">📥 Inbox</option>',b.getProjects().forEach(n=>{const i=document.createElement("option");i.value=n.id,i.textContent=`${n.name}`,this.currentProjectId===n.id&&(i.selected=!0),e.appendChild(i)})}renderViewHeader(){const e=document.getElementById("view-title"),t=document.getElementById("view-subtitle");if(!(!e||!t)){if(this.currentView==="all")e.innerHTML='<i class="fas fa-list-check" style="color: #6366f1;"></i> All Tasks',t.textContent="Complete inventory of all scheduled and active tasks";else if(this.currentView==="today")e.innerHTML='<i class="fas fa-sun" style="color: #fbbf24;"></i> Today',t.textContent="Tasks scheduled for completion today";else if(this.currentView==="upcoming")e.innerHTML='<i class="fas fa-calendar-alt" style="color: #818cf8;"></i> Upcoming (7 Days)',t.textContent="Tasks due within the next week";else if(this.currentView==="completed")e.innerHTML='<i class="fas fa-check-circle" style="color: #10b981;"></i> Completed',t.textContent="Finished tasks and archived items";else if(this.currentView==="project"&&this.currentProjectId){const n=b.getProjectById(this.currentProjectId);e.innerHTML=`<i class="${n.icon}" style="color: ${n.color}"></i> ${E(n.name)}`,t.textContent=`Tasks organized under ${E(n.name)}`}}}renderTaskListOnly(){const e=document.getElementById("tasks-list-container");if(!e)return;const t=this.getFilteredTasks();if(t.length===0){let n="No tasks found",i="No tasks match your current view or filter criteria.";this.searchQuery?(n="No matching tasks",i=`No tasks found matching "${E(this.searchQuery)}".`):this.currentView==="today"?(n="Nothing due today",i="You have no tasks scheduled for today. Take a break or plan ahead!"):this.currentView==="upcoming"?(n="No upcoming tasks",i="You have a clear horizon for the next 7 days."):this.currentView==="completed"&&(n="No completed tasks yet",i="Tasks you complete will be neatly logged here."),e.innerHTML=`
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="empty-state-title">${n}</div>
          <div class="empty-state-desc">${i}</div>
          <button class="btn-primary" id="empty-state-add-btn" style="margin-top: 0.5rem;">
            <i class="fas fa-plus"></i> Create First Task
          </button>
        </div>
      `;const a=e.querySelector("#empty-state-add-btn");a&&a.addEventListener("click",()=>{I.openCreate({projectId:this.currentProjectId||"inbox"})});return}e.innerHTML=t.map(n=>this.renderTaskCard(n)).join(""),this.attachTaskEvents(e)}renderTaskCard(e){const t=b.getProjectById(e.projectId),n=e.dueDate?V(e.dueDate):null,i=!e.completed&&e.dueDate&&x(e.dueDate),a=!e.completed&&e.dueDate&&B(e.dueDate);let r="";i?r="overdue":a&&(r="today");const o=this.selectedTaskIds.has(e.id),l=this.expandedTaskIds.has(e.id),c=U(e.title,e.description),d=C(e.title),u=e.description?C(e.description):"";return`
      <div class="task-item ${e.completed?"completed":""} ${c?"has-long-content":""} ${l?"expanded":""}" data-task-id="${e.id}">
        <div class="task-left-section">
          <input type="checkbox" class="task-select-checkbox" ${o?"checked":""} data-action="select" data-id="${e.id}" title="Select for bulk action">
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${e.completed?"checked":""} data-action="toggle" data-id="${e.id}" title="${e.completed?"Mark incomplete":"Mark complete"}">
          </div>
          <div class="task-details" data-action="edit" data-id="${e.id}">
            <div class="task-title-formatted ${!l&&c?"collapsed":""}">${d}</div>
            ${u?`
              <div class="task-description-formatted ${l?"":"collapsed"}">
                <div class="description-header"><i class="fas fa-align-left"></i> Notes / Acceptance Criteria:</div>
                <div class="description-body">${u}</div>
              </div>
            `:""}
            <div class="task-meta-row">
              <span class="badge badge-priority-${e.priority}" title="Priority: ${e.priority}">
                <i class="fas fa-flag"></i> ${e.priority}
              </span>
              <span class="badge badge-status ${e.status}" title="Status: ${e.status}">
                ${e.status}
              </span>
              <span class="badge badge-project" title="Project: ${E(t.name)}">
                <i class="${t.icon}" style="color: ${t.color}"></i> ${E(t.name)}
              </span>
              ${n?`
                <span class="badge-date ${r}" title="Due: ${e.dueDate}">
                  <i class="fas fa-calendar-day"></i> ${n}
                </span>
              `:""}
              ${c?`
                <button type="button" class="btn-task-expand" data-action="toggle-expand" data-id="${e.id}" title="${l?"Collapse task":"Expand full task & bullets"}">
                  <i class="fas ${l?"fa-chevron-up":"fa-chevron-down"}"></i>
                  <span>${l?"Show less":"Show full task"}</span>
                </button>
              `:""}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn" title="Edit Task" data-action="edit" data-id="${e.id}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="task-btn delete" title="Delete Task" data-action="delete" data-id="${e.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `}attachTaskEvents(e){e.querySelectorAll('[data-action="toggle"]').forEach(t=>{t.addEventListener("change",()=>{const n=t.getAttribute("data-id");m.toggleComplete(n)})}),e.querySelectorAll('[data-action="select"]').forEach(t=>{t.addEventListener("change",n=>{const i=t.getAttribute("data-id");t.checked?this.selectedTaskIds.add(i):this.selectedTaskIds.delete(i),this.updateBulkActionBar()})}),e.querySelectorAll('[data-action="toggle-expand"]').forEach(t=>{t.addEventListener("click",n=>{n.stopPropagation();const i=t.getAttribute("data-id");this.expandedTaskIds.has(i)?this.expandedTaskIds.delete(i):this.expandedTaskIds.add(i),this.renderTaskListOnly()})}),e.querySelectorAll('[data-action="edit"]').forEach(t=>{t.addEventListener("click",n=>{if(n.target.closest('[data-action="toggle-expand"]'))return;const i=t.getAttribute("data-id");I.openEdit(i)})}),e.querySelectorAll('[data-action="delete"]').forEach(t=>{t.addEventListener("click",n=>{n.stopPropagation();const i=t.getAttribute("data-id");h.confirmDeleteTask(i)})})}}const w=new J,K={activeView:"dashboard",activeProjectId:null,init(){this.setupNavigation(),this.setupMobileToggle(),this.setupClearCompleted(),this.render(),m.onChange(()=>{this.updateCounts(),w.renderCurrentView()}),b.onChange(()=>{this.renderProjectsList(),this.updateCounts(),w.renderCurrentView()})},setupNavigation(){document.querySelectorAll(".nav-item[data-view]").forEach(s=>{s.addEventListener("click",e=>{e.preventDefault();const t=s.getAttribute("data-view");this.setActive(t,null),this.closeMobileSidebar()})})},setupMobileToggle(){const s=document.getElementById("mobile-menu-btn"),e=document.getElementById("sidebar"),t=document.getElementById("sidebar-backdrop");s&&e&&t&&(s.addEventListener("click",()=>{e.classList.toggle("open"),t.classList.toggle("open")}),t.addEventListener("click",()=>{this.closeMobileSidebar()}))},closeMobileSidebar(){const s=document.getElementById("sidebar"),e=document.getElementById("sidebar-backdrop");s&&s.classList.remove("open"),e&&e.classList.remove("open")},setupClearCompleted(){const s=document.getElementById("sidebar-clear-completed-btn");s&&s.addEventListener("click",()=>{h.confirmClearCompleted()})},setActive(s,e=null){this.activeView=s,this.activeProjectId=e,document.querySelectorAll(".nav-item").forEach(t=>{t.classList.remove("active"),t.getAttribute("data-view")===s&&!e&&t.classList.add("active")}),document.querySelectorAll(".project-item").forEach(t=>{t.classList.remove("active"),s==="project"&&t.getAttribute("data-project-id")===e&&t.classList.add("active")}),w.setView(s,e)},render(){this.renderProjectsList(),this.updateCounts()},updateCounts(){const s=m.getStats(),e=document.getElementById("nav-badge-dashboard"),t=document.getElementById("nav-badge-all"),n=document.getElementById("nav-badge-today"),i=document.getElementById("nav-badge-upcoming"),a=document.getElementById("nav-badge-completed");e&&(e.textContent=s.total),t&&(t.textContent=s.pending),n&&(n.textContent=s.today),i&&(i.textContent=s.upcoming),a&&(a.textContent=s.completed),n&&s.overdue>0?n.classList.add("danger"):n&&n.classList.remove("danger");const r=m.getTasks();document.querySelectorAll(".project-item").forEach(o=>{const l=o.getAttribute("data-project-id"),c=o.querySelector(".project-task-count");if(c&&l){const d=r.filter(u=>!u.completed&&(u.projectId||"inbox")===l);c.textContent=d.length}})},renderProjectsList(){const s=document.getElementById("projects-list");if(!s)return;const e=b.getProjects(),t=m.getTasks(),n=t.filter(a=>!a.completed&&(!a.projectId||a.projectId==="inbox"));let i=`
      <div class="project-item ${this.activeView==="project"&&this.activeProjectId==="inbox"?"active":""}" data-project-id="inbox">
        <div class="project-meta">
          <div class="project-icon-badge" style="color: #6366f1;">
            <i class="fas fa-inbox"></i>
          </div>
          <span class="project-name">Inbox</span>
        </div>
        <div class="project-actions">
          <span class="nav-badge project-task-count">${n.length}</span>
        </div>
      </div>
    `;e.forEach(a=>{const r=t.filter(l=>!l.completed&&l.projectId===a.id),o=this.activeView==="project"&&this.activeProjectId===a.id;i+=`
        <div class="project-item ${o?"active":""}" data-project-id="${a.id}">
          <div class="project-meta">
            <div class="project-color-dot" style="background-color: ${a.color};"></div>
            <div class="project-icon-badge" style="color: ${a.color};">
              <i class="${a.icon}"></i>
            </div>
            <span class="project-name" title="${E(a.name)}">${E(a.name)}</span>
          </div>
          <div class="project-actions">
            <span class="nav-badge project-task-count">${r.length}</span>
            <button class="project-delete-btn" title="Delete Project" data-delete-project="${a.id}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `}),s.innerHTML=i,s.querySelectorAll(".project-item").forEach(a=>{a.addEventListener("click",r=>{if(r.target.closest(".project-delete-btn"))return;const o=a.getAttribute("data-project-id");this.setActive("project",o),this.closeMobileSidebar()})}),s.querySelectorAll(".project-delete-btn").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();const o=a.getAttribute("data-delete-project");H.openDeleteDialog(o)})})}};document.addEventListener("DOMContentLoaded",()=>{console.log("✨ ListaGo Task Manager initializing with Glassmorphism UI..."),f.init(),b.init(),m.init(),h.init(),H.init(),I.init(),w.init(),K.init(),w.setView("dashboard"),W();const s=document.getElementById("btn-shortcuts-help");s&&s.addEventListener("click",()=>{h.open("shortcuts-modal")}),console.log("🚀 ListaGo is ready!")});function W(){window.addEventListener("keydown",s=>{const e=["INPUT","TEXTAREA"].includes(s.target.tagName)||s.target.isContentEditable;if(s.key==="/"&&!e){s.preventDefault();const t=document.getElementById("header-search-input")||document.getElementById("content-search-input");t&&(t.focus(),t.select());return}if((s.ctrlKey||s.metaKey)&&(s.key==="a"||s.key==="A")&&!e){s.preventDefault();const t=document.getElementById("quick-add-input");t&&t.offsetParent!==null?t.focus():I.openCreate();return}if(s.key==="Delete"&&!e&&!h.activeModal){s.preventDefault(),h.confirmClearCompleted();return}if(s.key==="?"&&!e){s.preventDefault(),h.open("shortcuts-modal");return}})}
