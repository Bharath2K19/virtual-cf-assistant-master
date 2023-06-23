let voices;
let synthesis;
const awaitVoices = new Promise(resolve=> 
    window.speechSynthesis.onvoiceschanged = resolve)  
   .then(()=> {
    synthesis = window.speechSynthesis;
    voices = synthesis.getVoices();
  });

const header = document.querySelector(".hed");
const btn = document.querySelector(".submit-btn");
const inputForm = document.querySelector(".forms");
const userHandle = document.querySelector(".user-handle");
const music = document.querySelector(".audio");
const userDetails = document.querySelector(".details");
let id;

//for the input in the form if already saved !
window.addEventListener("load", ()=>{
    let UserHandle = getSavedValue("UserHandle");
    userHandle.value = UserHandle;
  });

btn.addEventListener("click", main);

function main(event) {
    
    event.preventDefault();
    const handle = userHandle.value;
    const api = `https://codeforces.com/api/user.info?handles=${handle}`;

    fetch(api)
            .then(response =>{
                return response.json();
            })
            .then(data =>{
                if(data.status === "OK"){
                    saveValue(userHandle);
                    getNewPage();
                    getInitial();
                }else{
                    alert("Enter a valid cf handle");
                }
            })
}

function getInitial(){
    const handle = userHandle.value;
    const api = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1`; 
    
    fetch(api)
        .then(response =>{
            return response.json();
        })
        .then(data =>{ 
            id = data.result[0].id;
            calls();
        })
}


 function calls()
 {
     setInterval(function(){ 
        const handle = userHandle.value;
        const api = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=2`; 
        
        fetch(api)
            .then(response =>{
                return response.json();
            })
            .then(data =>{
                let index = data.result[0].problem.index;
                if(index === "A") index = "AE";
                let curr_id = data.result[0].id;
                if(id != curr_id){
                        if(data.result[0].verdict && data.result[0].verdict != "TESTING"){
                            if(data.result[0].verdict === "OK"){
                                readOutLoud(`Well done ! AC on problem ${index}`);
                                playIt();
                            }
                            else {
                                let result = data.result[0].verdict; //get the verdict and remove under scores !
                                for(let i=0 ; i < result.length ; i++){
                                    if(result[i] === "_")
                                    result= result.replace(result[i]," ");
                                }
                                readOutLoud(`oops ! problem ${index} got ${result} on test ${data.result[0].passedTestCount + 1}`);
                            }                            
                            id = curr_id;
                        }
                }
                })
    }, 500);
 }


 
function saveValue(event){
    let val = event.value; 
    localStorage.setItem("UserHandle", val);// Every time user writing something, the localStorage's value will overwrite by key "UserHandle".
}

function getSavedValue (key){
    //key is "UserHandle" and it has some value if it is already set return that else return empty value.
    if (!localStorage.getItem(key)) {
        return "";
    }
    return localStorage.getItem(key);
}



function readOutLoud(text) {
      const speech = new SpeechSynthesisUtterance();
      speech.voice = voices[3];        
      speech.text = text;
      speech.rate = 0.9;
      synthesis.speak(speech);   
}

function playIt(){
    music.play();
}

function getNewPage(){
    inputForm.classList.add("delete");

    //create a new h1 for name/handle
    const name = document.createElement("h1");
    name.classList.add("name");

    //div wrapping both ranks and ratings
    const info = document.createElement("div");
    info.classList.add("info");

    //crate div for rating
    const Rating = document.createElement("div");
    Rating.classList.add("rating");
        //create two h3s
        const currRating = document.createElement("h3");
        const maxRating = document.createElement("h3");
        currRating.classList.add("rating");
        currRating.classList.add("current-details");
        maxRating.classList.add("rating");
        maxRating.classList.add("max-details");
        
        //append these to the curr details div
        Rating.appendChild(currRating);
        Rating.appendChild(maxRating);

    //crate div for max details
    const Rank = document.createElement("div");
    Rank.classList.add("rank");
        //create two h3s
        const currRank = document.createElement("h3");
        const maxRank = document.createElement("h3");  
        currRank.classList.add("rank"); 
        currRank.classList.add("current-details"); 
        maxRank.classList.add("rank");
        maxRank.classList.add("max-details");
        //append these to the max details div
        Rank.appendChild(currRank);
        Rank.appendChild(maxRank); 


        //add the values
        const handle = userHandle.value;
        const api = `https://codeforces.com/api/user.info?handles=${handle}`;

        fetch(api)
                .then(response =>{
                    return response.json();
                })
                .then(data =>{
                    name.innerText = `Hello, ${data.result[0].handle}`;
                    currRating.innerText = `current rating : ${data.result[0].rating}`;
                    currRank.innerText = `current rank : ${data.result[0].rank}`;
                    maxRating.innerText = `max rating : ${data.result[0].maxRating}`;
                    maxRank.innerText = `max rank : ${data.result[0].maxRank}`;
                    if(!data.result[0].maxRating){
                        currRating.innerText = `current rating : Unrated`;
                        currRank.innerText = `current rank : 0`;
                        maxRating.innerText = `max rating : Unrated`;
                        maxRank.innerText = `max rank : 0`;
                    }
                })

        //creating animation
        const animations = document.createElement("div");
        animations.classList.add("loading");
        const span = document.createElement("span");
        span.innerText = `Waiting for submissions !`;
        animations.appendChild(span);

    info.appendChild(Rating);  
    info.appendChild(Rank);  
    //add all of them to the main div    
    userDetails.appendChild(name);
    userDetails.appendChild(info);
    userDetails.appendChild(animations);
}
