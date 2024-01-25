// plaibook.js (c) Jim Goodell INFERable 2023
const dragoffset = {x: 0, y: 0};
const draglast = {x: 0, y: 0};
const centerXY = {x: 0, y: 0};
const player_position = {id: "C", name: "Center", relX: 0, relY: 0};
const playstep = {step: 0, player_positions: [player_position]};
const play = {name: "", steps: [playstep]};
const plays = [play];
const formation = {name: "", player_posiitons: [player_position]};
const formations = [formation];
const data={username:"", formations, plays};
data.formations=[];
data.plays=[];
var current_formation_name = ""; //The name of the current formation
var current_play_name = "";
var current_play_step = 0;
var current_play = play;
function toggleMenu() {
    var menu = document.getElementById('menu');
    if (menu.style.visibility=="visible") {menu.style.visibility="hidden";} else {menu.style.visibility="visible";}
}
function togglePractice() {
    // Hide maker components
    document.getElementById('buttonbar').style.visibility="hidden";
    default_lineup();
    toggleMenu();
}
function toggleMaker() {
    // Hide maker components
    document.getElementById('buttonbar').style.visibility="visible";
    default_lineup();
    toggleMenu();
}
function drag_start(event) {
    var dm = document.getElementById('dragme');
    // Compute position clicked within the object relative to the top left of the object, used for precice dropping
    dragoffset.x = dm.offsetLeft - event.clientX;
    dragoffset.y = dm.offsetTop - event.clientY;
} 
function drag_me(event) { 
    event.preventDefault(); 
    draglast.x = event.pageX;
    draglast.y = event.pageY;
    return false; 
} 
function drop_here(event) { 
    event.preventDefault();
    var dm = document.getElementById('dragme');
    dm.style.left = (draglast.x+dragoffset.x) + 'px';
    dm.style.top = (draglast.y+dragoffset.y) + 'px';
    dm.innerHTML = ((draglast.x-centerXY.x) + ", " + (draglast.y-centerXY.y));
    return false;
} 
function find_center() {
    // Find the horizontal center of the viewport field
    var pf = document.getElementById('playingfield');
    centerXY.x = Math.round(pf.clientWidth/2);
    centerXY.y = Math.round(pf.clientHeight/2);
    return true;
}
function default_lineup() {
    find_center();
    // Move line of scrimage to middle
    var ls = document.getElementById('lineofscrimage');
    ls.style.top = centerXY.y + 'px';
    // Each player is positioned relative to center of line of scrimage
    const player_position = {id: "C", name: "Center", relX: 0, relY: 0};
    // Constructor for default formation
    const play_snapshot = {step: 0, player_positions: [{id: "LWR", name: "Left Wide Receiver", relX: -120, relY: 10}, {id: "LT", name: "Left Tackle", relX: -36, relY: 10}, {id: "LG", name: "Left Guard", relX: -17, relY: 10}, {id: "C", name: "Center", relX: 0, relY: 10}, {id: "RG", name: "Right Guard", relX: 17, relY: 10}, {id: "RT", name: "Right Tackle", relX: 36, relY: 10}, {id: "TE", name: "Tight End", relX: 80, relY: 20}, {id: "RWR", name: "Right Wide Receiver", relX: 120, relY: 10}, {id: "QB", name: "Quarterback", relX: 0, relY: 70}, {id: "FB", name: "Fullback", relX: 0, relY: 50}, {id: "HB", name: "Halfback", relX: 0, relY: 30}]};

    // Place players on field
    for (let player_posiiton of play_snapshot.player_positions) {
        var div = document.createElement("div");
        div.className = "draggable";
        div.className = "player";
        div.style.top = (player_posiiton.relY+centerXY.y) + "px";
        div.style.left = (player_posiiton.relX+centerXY.x) + "px";
        div.draggable="true";
        div.id = player_posiiton.id;
        div.name = player_posiiton.name;
        div.innerHTML = "O";
        
        var tooltipspan = document.createElement("span");
        tooltipspan.className = "tooltiptext";
        tooltipspan.innerHTML = player_posiiton.name;
        div.appendChild(tooltipspan);
        
        document.body.appendChild(div);
        var thisDiv = document.getElementById(player_posiiton.id);
        
        // Add event dragable handlers
        thisDiv.ondragstart = function(event) {
            var dm = event.target;
            dragoffset.x = dm.offsetLeft - event.clientX; // Compute position clicked within the object relative to the top left of the object, used for precice dropping
            dragoffset.y = dm.offsetTop - event.clientY;
        };
        
        thisDiv.ondrag = function(event) {
            draglast.x = event.pageX;
            draglast.y = event.pageY;
        };
        
        thisDiv.ondragend = function(event) {
            event.target.style.left = (draglast.x+dragoffset.x) + 'px';
            event.target.style.top = (draglast.y+dragoffset.y) + 'px';
            //event.target.innerHTML = ((draglast.x-centerXY.x) + ", " + (draglast.y-centerXY.y));
            return false;
        };
        
    }
    loadFromCookie();
}
function getFormationByName(formation_name) {
    for (let f of formations) {
        if (f.name==formation_name) {
            return f;
        } else {
            return null;
        }
    }
}
function saveFormation() {
    find_center();
    let formation_name = prompt("Formation name", current_formation_name);
    // Create JSON object from the current DOM objects
    const newFormation = {name: formation_name, player_positions: []};
    document.querySelectorAll('.player').forEach( player => {
        // Get values from the DIV element into string of JSON object
        const newPlayerPosition = {id: player.id, name: player.name, relX: (Number.parseInt(player.style.left)-centerXY.x), relY: (Number.parseInt(player.style.top)-centerXY.y)};
        newFormation.player_positions.push(newPlayerPosition);
    });
    // Does the formation already exist in the data model?
    var existingFormation = getFormationByName(formation_name);
    if (existingFormation!=null) {
        if (confirm("The formation " + formation_name + " exists? Replace it?")) {
            existingFormation = newFormation;
            current_formation_name = formation_name;
        };
    } else {
        current_formation_name = formation_name;
        formations.push(newFormation);
    }
    saveToCookie();
}
function getPlayByName(playname) {
    for (let p of data.plays) {
        if (p.name==playname) {
            current_play = p; // Set as global
            return p;
        }
    }
    return false;
}
function getPlayStep(play, step) {
    for (let s of play.steps) {
        if (s.step==step) {
            return s;
        } else {
            return false;
        }
    }
    return false;
}
function setCurrentPlayStep(playerpositions) {
    var p = getPlayByName(current_play_name);
    var s = getPlayStep(p,current_play_step);
    s.player_posiitons=playerpositions;
    setCurrentPlay();
    tempstatus("Play step updated.");
    return true;
}
function setCurrentPlay() {
    //Store the current play to the data object
    for (i=0; i<data.plays.length-1; i++) {
        let p = data.plays[i];
        if (p.name==current_play_name) {
            data.plays[i] = current_play;
            return p;
        }
    }
}

function getPlayerPositions() {
    find_center();
    const newPlayStep = {step: current_play_step, player_positions: []};
    // Create JSON object from the current DOM objects
    document.querySelectorAll('.player').forEach( player => {
        // Get values from the DIV element into string of JSON object
        const newPlayerPosition = {id: player.id, name: player.name, relX: (Number.parseInt(player.style.left)-centerXY.x), relY: (Number.parseInt(player.style.top)-centerXY.y)};
        newPlayStep.player_positions.push(newPlayerPosition);
    });
    return newPlayStep;
}
function setPlayStep() {
    // Create JSON play step object from the player objects in DOM
    let domPlayStep = getPlayerPositions();
    // Check for current play
    var current_play = getPlayByName(current_play_name);
    if (current_play) {
        // Does the step exist?
        var s = getPlayStep(current_play,current_play_step);
        if (s) {
            current_play.steps[current_play_step] = domPlayStep;
        } else {
            current_play_step = current_play.steps.push(domPlayStep)-1; //Add the step to the data
            
        };
        //WARN: May need code to ensure added step is sequentially numbered
    } else {
        // New play -- must have a name
        if (current_play_name=="") {
            playname = prompt("Play name", "");
        }
        current_play_name = playname;
        current_play_step=0;
        current_play = createPlay(playname);
        current_play.steps.push(domPlayStep);
    }
    setCurrentPlay();
    updateStatus();
    //saveToCookie();
}
function createPlay(playname) {
    var newPlay = {name: playname, steps: []};
    var arrayLen = data.plays.push(newPlay);
    return data.plays[arrayLen-1];
}
// function savePlayStep() {
//     //Deprecate -- replace with setPlayStep
// 	find_center();
//     // Play must have a name
//     if (current_play_name=="") {
// 	    playname = prompt("Play name", "");
//     }
// 	const newPlayStep = {step: current_play_step, player_positions: []};
//     // Create JSON object from the current DOM objects
//     document.querySelectorAll('.player').forEach( player => {
//         // Get values from the DIV element into string of JSON object
//         const newPlayerPosition = {id: player.id, name: player.name, relX: (Number.parseInt(player.style.left)-centerXY.x), relY: (Number.parseInt(player.style.top)-centerXY.y)};
//         newPlayStep.player_positions.push(newPlayerPosition);
//     });
// 	// Does the play already exist in the data model?
//     var existingPlay = getPlayByName(playname);
//     if (existingPlay!=null) {
//         // Does the play step exist?
//         var existingPlayStep = getPlayStep(existingPlay, current_play_step);
//         if (existingPlayStep==null) {
//             //add the step
//             existingPlay.steps.push(newPlayStep);
//         } else {
//             //overwrite the step
//             existingPlayStep = newPlayStep;
//         }
//     } else {
//         // Create the play and step
//         const newPlay = {name: playname, steps: []};
//         newPlay.steps.push(newPlayStep);
//         plays.push(newPlay);
//         current_play_name = playname;
//         current_play = newPlay; // Set as global
//     }
//     // Update global dataset with newplays
//     data.plays=plays;
//     updateStatus();
//     saveToCookie();
// }
function addPlayStep() {
    if (current_play!=null && current_play.steps!=null && current_play.steps.length>0) {
        current_play_step++ 
    } else {
        alert("Save step 0 before adding a step.");
    }
    updateStatus();
}
function reset() {
    current_formation_name = "";
    current_play_name = "";
    current_play_step = 0;
    data.formations = [];
    data.plays=[];
    document.querySelectorAll('.player').forEach( p => {p.remove();}); //Clear the field
    clearVectors();
    default_lineup();
    updateStatus();
}
function newPlay() {
    reset();
    var playname = prompt("Play name", "");
    current_play_name = playname;
    current_play_step=0;
    current_play = createPlay(playname);
    setPlayStep();
}
function deletePlay() {
    // TO DO
}
function updateStatus() {
    document.getElementById("status").innerHTML = "Play: <select id='playselect'  onchange='selectPlay()'><option value=''>---</option></select> | Play Step: <a href='javascript:stepBack()'>&lt;</a> " + current_play_step + " <a href='javascript:stepForward()'>&gt;</a>";
    updatePlaySelector();
}
function updatePlaySelector() {
    playselect = document.getElementById("playselect");
    // Remove and then re-add the options
    while (playselect.firstChild) {
        playselect.firstChild.remove();
    }
    data.plays.forEach(p =>{
        var opt = document.createElement('option');
        opt.value = p.name;
        opt.innerHTML = p.name;
        opt.selected = false;
        if (p.name==current_play_name) {opt.selected = true;};
        playselect.appendChild(opt);
    });
    if (data.plays.length==0) {
        
    }
}
function selectPlay() {
    playselect = document.getElementById("playselect");
    current_play_name = playselect.value;
    current_play = getPlayByName(current_play_name);
    current_play_step = 0;
    tempstatus("Play '" + current_play_name + "' selcted.");
    animatePlayStep(100);
}
function clearVectors() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
}
function getPlayerVectors() {
    //Get the play
    var existingPlay = getPlayByName(current_play_name);
    const playerVectors = [];
    if (existingPlay!=null) {
        existingPlay.steps.forEach(s =>{
            for (i=0;i<s.player_positions.length;i++) {
                pp = s.player_positions[i];
                if (s.step==0) { 
                    //on first step create the vectors for all players on the field
                    const playerVector = {id: pp.id, coordinates: [{x: pp.relX,y: pp.relY}]};
                    playerVectors.push(playerVector);
                } else {
                    // on subsequent steps find the player vector array and append coordinates
                    playerVectors[i].coordinates.push({x:pp.relX,y:pp.relY});
                }
            };
        });
    }
    return playerVectors;
}
function drawVectors() {
    // Create a Canvas:
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    let playerVectors = getPlayerVectors(); //Gets vectors for current play
    playerVectors.forEach(pv=>{
        let coords=pv.coordinates;
        for (i=0;i<coords.length-1;i++) {
            const coordStart = coords[i];
            const coordEnd = coords[i+1];
            ctx.beginPath();
            ctx.moveTo(centerXY.x+coordStart.x+10,centerXY.y+coordStart.y+10);
            ctx.lineTo(centerXY.x+coordEnd.x+10,centerXY.y+coordEnd.y+10);
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            
            if (i==coords.length-2) { //Add arrow head on last segment
                drawVectorWithArrow(ctx,centerXY.x+coordStart.x+10,centerXY.y+coordStart.y+10,centerXY.x+coordEnd.x+10,centerXY.y+coordEnd.y+10);
            }
        };
    });
}
function drawVectorWithArrow( context, fromx, fromy, tox, toy ) {
    const dx = tox - fromx;
    const dy = toy - fromy;
    const headlen = Math.sqrt( dx * dx + dy * dy ) * 0.3; // length of head in pixels
    const angle = Math.atan2( dy, dx );
    context.beginPath();
    context.moveTo( tox - headlen * Math.cos( angle - Math.PI / 6 ), toy - headlen * Math.sin( angle - Math.PI / 6 ) );
    context.lineTo( tox, toy );
    context.lineTo( tox - headlen * Math.cos( angle + Math.PI / 6 ), toy - headlen * Math.sin( angle + Math.PI / 6 ) );
    context.stroke();
}
function deleteData() {
    var c = confirm("Are you sure? This will delete all data.");
    if (c) {
        data.plays = [];
        data.formations = [];
        current_play_name = "";
        current_play_step = 0;
        current_play = null;
        updateStatus();
        var d= new Date();
        document.cookie = "data=''; expires="+d.toUTCString();
    }
}
function saveToCookie() {
    // Save the entire data set to a cookie
    var dataString=JSON.stringify(data);
    alert(dataString);
    const d = new Date();
    d.setTime(d.getTime() + (1*24*60*60*1000)); //for testing set expire in one day
    document.cookie = "data="+dataString+"; expires="+d.toUTCString();
}
function loadFromCookie() {
    try {
        let tempdata = JSON.parse(getCookie("data"));
        data.name=tempdata.name;
        data.plays=tempdata.plays;
        data.formations=tempdata.formations;
        tempstatus("Loaded from cookie: " + data.plays.length + " plays.");
        if (data.plays.length>0) {
            current_play=data.plays[0];
            current_play_name=current_play.name;
            current_play_step=0;
            //alert(JSON.stringify(data));
            updateStatus();
        }
    } catch(e) {
        tempstatus("Data from cookie could not be loaded.");
    }
}
// function debugRoundtripCookie() {
//     var dataString=JSON.stringify(data);
//     saveToCookie();
//     if (dataString==JSON.stringify(data)) {
//         tempstatus("Good cookie");
//     } else {
//         tempstatus("Bad cookie");
//     }
// }
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}
function tempstatus(msg) {
    document.getElementById("tempstatus").innerHTML=msg;
}
function displayPlayerPositions(playstep) {
    tempstatus("Moving players to position " + playstep + " of play " + current_play_name + ".");
    // Get the player's position coordinates move the object there
    current_play = getPlayByName(current_play_name);
    current_play.steps[current_play_step].player_positions.forEach(pp =>{
            var thisPlayer = document.getElementById(pp.id);
            tempstatus(pp.id + ":" + pp.relY + " in " + current_play_name);
            thisPlayer.style.top=(centerXY.y+pp.relY);
            thisPlayer.style.left=(centerXY.x+pp.relX); 
    });  
}
function stepBack() {
    if (current_play_step>0) {current_play_step--};
    animatePlayStep(2000);
    updateStatus();
}
function stepForward() {
    if (current_play_step<(current_play.steps.length-1)) {current_play_step++};
    animatePlayStep(2000);
    updateStatus();
}
function repositionThisPlayer(event) {
    // Get the player's position coordinates move the object there
    current_play.steps[current_play_step].player_positions.forEach(pp =>{
        if (pp.id=this.id) {
            this.style.top=(centerXY.y+pp.relY);
            this.style.left=(centerXY.x+pp.relX);
        }    
    }); 
}
function animatePlayStep(speed) {
    //speed = speed of animation in ms
    //HACK: Something with the data breaks and loses id property unless we stringify and then parse
    var ds = JSON.stringify(current_play.steps[current_play_step].player_positions);
    var d = JSON.parse(ds);
    //END HACK
    for (i=0; i<d.length-1;i++) {
        var pp=d[i];
        var thisPlayer = document.getElementById(pp.id);
        if (thisPlayer!=null) {$(thisPlayer).animate({left: (centerXY.x+pp.relX),top: (centerXY.y+pp.relY)},speed,repositionThisPlayer());};
    };       
}
function animatePlay() {
    current_play_step = 0;
    animatePlayStep(0); // 0 speed jumps players to starting position
    animateNextStep();  
}
function animateNextStep() {
    updateStatus();
    animatePlayStep(3000); // 3000 takes 3 seconds to move to next posiiton
    if (current_play_step<current_play.steps.length-1) {
        current_play_step++;
        setTimeout(animateNextStep(),4000);
    }
}