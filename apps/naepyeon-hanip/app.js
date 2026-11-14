const moods=[
['02','따뜻한 쉼표','따뜻한 차 · 버터 쿠키','컵이 식기 전까지만, 오늘 생각은 잠깐 내려놓아요.','따뜻한 차와 간식'],
['06','바삭한 기분','감자칩 · 미니 프레첼','바삭한 소리에 오늘의 답답함도 털어봐요.','바삭한 감자칩'],
['11','달콤한 보상','마들렌 · 초콜릿','오늘 해낸 일을 하나 떠올리고 달콤하게 마무리해요.','부드러운 마들렌'],
['18','가벼운 한 칸','고소한 견과 · 쌀과자','입이 심심한 저녁, 가볍게 한 줌만 꺼내요.','고소한 견과류']
];
const buttons=[...document.querySelectorAll('[data-mood]')];
buttons.forEach(button=>button.addEventListener('click',()=>{
 const index=Number(button.dataset.mood),[id,name,snacks,note,alt]=moods[index];
 buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 const image=document.querySelector('#pick-image'); image.src='assets/'+id+'.png'; image.alt=alt;
 for(const [key,value] of Object.entries({number:String(index+1).padStart(2,'0')+' / 추천 한입',name,snacks,note})) document.querySelector('#pick-'+key).textContent=value;
}));
const videos=[...document.querySelectorAll('video')];
videos.forEach(video=>video.addEventListener('play',()=>videos.forEach(other=>{if(other!==video)other.pause()})));
