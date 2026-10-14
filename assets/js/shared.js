(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function markdownToHtml(md, options={}){
  const source=String(md??""); const baseUrl=options.baseUrl||"";
  const cleaned=source.replace(/<a\s+(?:name|id)\s*=\s*(["']).*?\1\s*>\s*<\/a\s*>/gi,"").replace(/<a\s+(?:name|id)\s*=\s*[^\s>]+\s*>\s*<\/a\s*>/gi,"").replace(/&lt;a\s+(?:name|id)\s*=.*?&gt;\s*&lt;\/a&gt;/gi,"");
  const resolveLinks=html=>{if(!baseUrl)return html;const t=document.createElement("template");t.innerHTML=html;t.content.querySelectorAll("img[src],a[href],source[src]").forEach(el=>{const attr=el.hasAttribute("src")?"src":"href",v=el.getAttribute(attr);if(!v||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:|mailto:|tel:)/i.test(v))return;try{el.setAttribute(attr,new URL(v,baseUrl).href)}catch{}});return t.innerHTML;};
  if(window.marked&&typeof window.marked.parse==="function") {try {window.marked.setOptions({gfm:true,breaks:false});let html=window.marked.parse(cleaned);if(window.DOMPurify&&window.DOMPurify.sanitize)html=window.DOMPurify.sanitize(html,{USE_PROFILES:{html:true},ADD_ATTR:["target","rel","id","name","colspan","rowspan","align","loading"],ADD_TAGS:["details","summary"]});else html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,"").replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/javascript\s*:/gi,"");return resolveLinks(html)}catch(e){console.warn("Marked rendering failed; using fallback renderer",e)}}
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const inline=s=>esc(s).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,'<img alt="$1" src="$2" loading="lazy">').replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/__([^_]+)__/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g,"$1<em>$2</em>").replace(/~~([^~]+)~~/g,"<del>$1</del>");
  const lines=cleaned.replace(/\r/g,"").split("\n");let out="",para=[],list=null,code=false,codeLang="",codeLines=[];const flush=()=>{if(para.length){out+="<p>"+inline(para.join(" "))+"</p>";para=[]}};const close=()=>{if(list){out+="</"+list+">";list=null}};
  for(let i=0;i<lines.length;i++){const line=lines[i];if(/^```/.test(line.trim())){flush();close();if(!code){code=true;codeLang=line.trim().slice(3).trim();codeLines=[]}else{out+=`<pre><code${codeLang?` class="language-${esc(codeLang)}"`:""}>${esc(codeLines.join("\n"))}</code></pre>`;code=false;codeLang=""}continue}if(code){codeLines.push(line);continue}if(!line.trim()){flush();close();continue}
    if(i+1<lines.length&&/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1])&&line.includes("|")){flush();close();const cells=s=>s.trim().replace(/^\|/,"").replace(/\|$/ ,"").split("|").map(x=>x.trim());const heads=cells(line),align=cells(lines[i+1]).map(x=>x.startsWith(":")&&x.endsWith(":")?"center":x.endsWith(":")?"right":x.startsWith(":")?"left":"");out+='<div class="table-wrap"><table><thead><tr>'+heads.map((c,j)=>`<th${align[j]?` style="text-align:${align[j]}"`:""}>${inline(c)}</th>`).join("")+"</tr></thead><tbody>";i+=2;while(i<lines.length&&lines[i].includes("|")&&lines[i].trim()){const row=cells(lines[i]);out+="<tr>"+heads.map((_,j)=>`<td${align[j]?` style="text-align:${align[j]}"`:""}>${inline(row[j]||"")}</td>`).join("")+"</tr>";i++}out+="</tbody></table></div>";i--;continue}
    const h=line.match(/^(#{1,6})\s+(.+)$/);if(h){flush();close();out+=`<h${h[1].length}>${inline(h[2].replace(/<a\b[^>]*>\s*<\/a>/gi,"").trim())}</h${h[1].length}>`;continue}if(/^\s*([-*_]\s*){3,}$/.test(line)){flush();close();out+="<hr>";continue}const li=line.match(/^\s*([-+*]|\d+[.)])\s+(.+)$/);if(li){flush();const kind=/^\d/.test(li[1])?"ol":"ul";if(list!==kind){close();list=kind;out+="<"+list+">"}out+="<li>"+inline(li[2])+"</li>";continue}const q=line.match(/^\s*>\s?(.*)$/);if(q){flush();close();out+="<blockquote>"+inline(q[1])+"</blockquote>";continue}close();para.push(line.trim())}
  flush();close();if(code)out+="<pre><code>"+esc(codeLines.join("\n"))+"</code></pre>";return resolveLinks(out)
}
const DEFAULT_DATA={
 manuals:[
  {id:"sample-getting-started",title:"Getting started",category:"Getting started",description:"Learn the essentials and find your way around the product.",url:"",markdown:"# Getting started\n\nWelcome to the DocsHub user manual.\n\n## Before you begin\n\n- Review the product requirements.\n- Keep the product details nearby.\n\n## First steps\n\n1. Open the product.\n2. Follow the setup instructions provided by your team.\n3. Review the troubleshooting FAQ if you need help.",updated:"2026-10-13"},
  {id:"sample-troubleshooting",title:"Troubleshooting guide",category:"Troubleshooting",description:"Check common issues and recommended next steps.",url:"",markdown:"# Troubleshooting guide\n\n## Before contacting support\n\n1. Record the exact error message.\n2. Note the product and version.\n3. List the steps you have already tried.\n\nContact support if the issue continues.",updated:"2026-10-13"}
 ],
 quickLinks:[],
 faqs:[
  {id:"sample-faq-1",question:"Where can I find the latest user manual?",answer:"Browse the User manuals section above. The latest approved guide should be linked there.",category:"Documentation"},
  {id:"sample-faq-2",question:"How do I report a problem?",answer:"Include the product name, version, exact error message, and steps to reproduce the issue.",category:"Support"}
 ],
 settings:{supportEmail:"support@example.com"}
};
const STORE_KEY="docshub-admin-customer-v1";
function getData(){try{const raw=localStorage.getItem(STORE_KEY);if(!raw)return structuredClone(DEFAULT_DATA);const d=JSON.parse(raw);if(!d||!Array.isArray(d.manuals)||!Array.isArray(d.faqs))throw Error("Saved data has an unexpected format.");return d;}catch(e){console.error(e);return structuredClone(DEFAULT_DATA);}}
function saveData(data){try{localStorage.setItem(STORE_KEY,JSON.stringify(data));return true;}catch(e){throw new Error("Could not save data in this browser. Check available storage space or browser privacy settings.");}}
function uniqueId(){return "item-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);}
function normalizeUrl(url){return String(url||"").trim().replace(/#.*$/,"").replace(/\/+$/,"");}
function normalizeMarkdownInput(value){
 let text=String(value||"").trim().replace(/^['\"]|['\"]$/g,"");
 if(text && !/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text="https://"+text;
 return text;
}
function looksLikeMarkdownUrl(value){
 try{
  const u=new URL(normalizeMarkdownInput(value));
  if(u.protocol!=="https:")return false;
  const host=u.hostname.toLowerCase().replace(/^www\./,"");
  const path=u.pathname;
  const isRawGitHub=host==="raw.githubusercontent.com";
  const isGitHubBlob=host==="github.com" && /\/blob\//.test(path);
  const isDirectMarkdown=/\.(md|markdown|mdown|mdx)$/i.test(path);
  return (isRawGitHub && path.split("/").filter(Boolean).length>=4) || isGitHubBlob || isDirectMarkdown;
 }catch{return false;}
}
function githubBlobToRaw(value){
 try{const u=new URL(value);if(u.hostname==="github.com"&&u.pathname.includes("/blob/")){u.hostname="raw.githubusercontent.com";u.pathname=u.pathname.replace("/blob/","/");u.search="";u.hash="";return u.toString();}}catch{}return value;
}
function markdownBaseUrl(url){try{return new URL(".",githubBlobToRaw(url)).href}catch{return url}}
async function loadMarkdownUrl(url){
 const fetchUrl=githubBlobToRaw(url);
 const response=await fetch(fetchUrl,{headers:{Accept:"text/plain"},cache:"no-store"});
 if(!response.ok)throw new Error("Could not load Markdown (HTTP "+response.status+"). Check that the repository and file are public and the URL points to an existing .md file.");
 const text=await response.text();
 if(text.trim().startsWith("<!DOCTYPE html")||text.includes("<html"))throw new Error("This link returned an HTML page, not raw Markdown. Use the raw.githubusercontent.com URL or a GitHub file URL ending in /blob/.");
 if(!text.trim())throw new Error("The Markdown file is empty.");
 return text;
}
window.DocsHub={ $,escapeHtml,markdownToHtml,DEFAULT_DATA,getData,saveData,uniqueId,normalizeUrl,normalizeMarkdownInput,looksLikeMarkdownUrl,githubBlobToRaw,markdownBaseUrl,loadMarkdownUrl,STORE_KEY };
document.addEventListener("DOMContentLoaded",()=>{
 const saved=localStorage.getItem("docshub-theme");if(saved==="dark"||saved==="light")document.documentElement.dataset.theme=saved;
 const toggle=$("#theme-toggle");if(toggle)toggle.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem("docshub-theme",next);});
 const menu=$("#menu-btn");if(menu)menu.addEventListener("click",()=>$(".nav")?.classList.toggle("open"));
 const year=$("#year");if(year)year.textContent=new Date().getFullYear();
});
})();
