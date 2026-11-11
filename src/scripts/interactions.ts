const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

// Progressive enhancement: content is visible if JavaScript or observers are unavailable.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
 document.documentElement.classList.add('motion-ready');
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
 }), {threshold: .1});
 $$('.reveal').forEach(el=>observer.observe(el));
}
const heroSlides = $$('.hero-slide');
let heroIndex = 0;
function showHero(next: number) {
 heroIndex = (next + heroSlides.length) % heroSlides.length;
 heroSlides.forEach((el,i)=>el.classList.toggle('active',i===heroIndex));
 $('#slide-number').textContent=String(heroIndex+1).padStart(2,'0');
}
$('#hero-prev').addEventListener('click',()=>showHero(heroIndex-1));
$('#hero-next').addEventListener('click',()=>showHero(heroIndex+1));

const tabs = $$<HTMLButtonElement>('[data-room-tab]');
function selectRoom(index: number, focus = false) {
 tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
 $$('.suite-panel').forEach((panel,i)=>panel.hidden=i!==index);
 if(focus)tabs[index].focus();
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectRoom(index));
 tab.addEventListener('keydown',(event)=>{
  let next:number|undefined;
  if(event.key==='ArrowRight')next=(index+1)%tabs.length;
  if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
  if(event.key==='Home')next=0;
  if(event.key==='End')next=tabs.length-1;
  if(next!==undefined){event.preventDefault();selectRoom(next,true);}
 });
});

const dateIn = $<HTMLInputElement>('#checkin');
const dateOut = $<HTMLInputElement>('#checkout');
const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
dateIn.min=formatDate(today);dateIn.value=formatDate(today);
dateOut.min=formatDate(tomorrow);dateOut.value=formatDate(tomorrow);
dateIn.addEventListener('change',()=>{
 if(!dateIn.value)return;
 const minimum = new Date(`${dateIn.value}T12:00:00`);minimum.setDate(minimum.getDate()+1);
 dateOut.min=formatDate(minimum);
 if(dateOut.value<=dateIn.value)dateOut.value=dateOut.min;
 dateOut.setCustomValidity('');
});
dateOut.addEventListener('change',()=>dateOut.setCustomValidity(''));
$('.booking-form').addEventListener('submit',event=>{
 if(dateOut.value<=dateIn.value){
  event.preventDefault();
  dateOut.setCustomValidity(document.documentElement.lang==='en'?'Choose a departure date after arrival.':'Elige una salida posterior a la llegada.');
  dateOut.reportValidity();
 }
});

let opener: HTMLElement | null=null;
function openDialog(dialog: HTMLDialogElement, trigger?: HTMLElement) {
 opener=trigger??document.activeElement as HTMLElement;
 dialog.showModal();document.body.classList.add('modal-open');
}
$$<HTMLDialogElement>('dialog').forEach(dialog=>{
 dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
});
const menu = $<HTMLDialogElement>('#mobile-menu');
$('.menu-toggle').addEventListener('click',event=>openDialog(menu,event.currentTarget as HTMLElement));
menu.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>menu.close()));
$('#credits-open').addEventListener('click',event=>openDialog($<HTMLDialogElement>('#credits'),event.currentTarget as HTMLElement));
const lightbox=$<HTMLDialogElement>('#lightbox');
let images:string[]=[];let photoIndex=0;let caption='';
function renderPhoto(index:number){
 photoIndex=(index+images.length)%images.length;
 const photo=$<HTMLImageElement>('#lightbox-image');photo.src=images[photoIndex];photo.alt=`${caption} — ${photoIndex+1}`;
 $('#lightbox-title').textContent=caption;
 $('#lightbox-counter').textContent=`${String(photoIndex+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;
}
$$('[data-gallery-open]').forEach(button=>button.addEventListener('click',()=>{
 images=button.dataset.images!.split('|');caption=button.dataset.caption!;
 renderPhoto(Number(button.dataset.index??0));openDialog(lightbox,button);
}));
$('#lightbox-prev').addEventListener('click',()=>renderPhoto(photoIndex-1));
$('#lightbox-next').addEventListener('click',()=>renderPhoto(photoIndex+1));
lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();renderPhoto(photoIndex-1);}if(event.key==='ArrowRight'){event.preventDefault();renderPhoto(photoIndex+1);}});
