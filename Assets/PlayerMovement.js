﻿#pragma strict 

 public var speed : float = 1.0;
 public var jumpForce : float = 100;
 public var jumpDelay : float = 40;
 public var ghostPrefab : GameObject; 
 
 var recording : boolean = true; //decides whether we are recording player movements right now
 var startPosition : Vector3 = new Vector3(); //where all the ghosts start

 
 var jumpCounter : int = 0; //counts how long the player is in the air
 var roundNumber : int = 0; //counts which "round" we are on - ie how many times the player has recorded movements and how many ghosts we therefore have
 var roundCounter : int = 0; //counts the frames so far in this "round"
 
 var playerRecord : Array = new Array(); //will store the player's movements each round
 var ghosts = new GameObject[99]; //will contain the list of ghost objects
 
 var distToGround: float; //used for raycasting in jump script
 
 //experimental game variables
 var resetPlayerEveryGo : boolean = false; //if true, the player (and therefore all ghosts) will start in the same place each round
 var giveGhostsRigidBodies : boolean = false; //if true, the ghosts will be affected by gravity when they finish moving
 var ghostsPlayFullRecord : boolean = false; //if true, every ghost will replay all the player's movements FROM THE START

 function Update() {
 
    if (Input.GetKeyDown("a")) { //the input key for starting/ending recording the player movement
    	
    	
    	//USE THIS CODE FOR "A" TO STOP & START RECORDING
    	//if (recording) { 
    	//	stopRecording();
		//}
		//else {
		//	startRecording();
		//}
		
		//USE THIS CODE FOR "A" TO JUST START A NEW LOAD OF GHOSTS
		stopRecording();
		startRecording();
    }
    
     if (Input.GetKeyDown("s")) { //speedy reset code for experimenting!
     	
     	resetGame();
     }
    
    
    
    
    if (recording) { //if we are in the state of recording player movements...
    
    	//let the player move around
	    var move = Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
	    transform.position += move * speed * Time.deltaTime; 
	    
	    //let the player jump - v hacky right now!
	    if (Input.GetKeyDown("space") && isGrounded()) {
		    GetComponent.<Rigidbody>().AddForce (new Vector2(0, jumpForce));
		    jumpCounter=0;
	    }
	    
	    jumpCounter++; //crappy jump hack
	    
	    //store the position of the player
	    playerRecord[roundCounter] = transform.position;
	    roundCounter++;
	    
    }
    
    else { //nothing here for now...
	
    }
 }
 
 function startRecording() { //start recording player movements
	 Debug.Log("start recording");
	 startPosition = transform.position; //record the starting position for the rest of the game
	 recording=true;
 }
 
 function stopRecording() { //stop recording player movements and start ghosts playback
 
	Debug.Log("stop recording");
 	recording = false;


 	 spawnGhost(); //spawn a new ghost based on the player movements we've been recording
  	 roundNumber++; //increase which round we are on
 	 startGhosts(); //set the ghosts in motion
 	 
 	 if (!ghostsPlayFullRecord) { //experimental game variable
		 playerRecord.Clear(); //clear the record of the player's movements ready for the next round
	   	roundCounter=0;
 	 }
 
 	
 }
 
 function spawnGhost() { //spawns a new ghost at the start of a round
 	//instantiate a new ghost object
 	var newGhost:GameObject = Instantiate(ghostPrefab, startPosition, Quaternion.identity);
 	
 	//pass on the recorded player movements from this round into the PlayerGhost.js script
 	newGhost.GetComponent(PlayerGhost).ghostRecord = playerRecord.slice(0, playerRecord.length);	
 	
    //Debug.Log(ghosts);
 	ghosts[roundNumber] = newGhost; //add the new ghost into the ghost array
 	
 	//experimental game variables
 	if (resetPlayerEveryGo) { //sets the player and every ghost back to the start point each round
 		transform.position = startPosition;
 	}
 	
 	if (giveGhostsRigidBodies) { //ghosts will have rigidbodies and sobe affected by gravity when they stop moving
 		newGhost.AddComponent.<Rigidbody>();
 	}
 	
 }
 
 function startGhosts() { //sets all the ghosts in motion
 	for (var i = 0; i<roundNumber; i++) { //loop through the ghosts
 		Debug.Log("ghost" + i + " is starting playback");
 		ghosts[i].GetComponent(PlayerGhost).startingPlayback = true; //this sets off a function in the PlayerGhost.js script
 	}
 }
 
 
 function Start() {
	 distToGround = GetComponent.<Collider>().bounds.extents.y; //set the object height for raycasting later
	 startPosition = transform.position; //the starting position for the player/ghosts
 }
 
 function isGrounded(): boolean { //function to find out if the player is on the ground / a surface
   return Physics.Raycast(transform.position, -Vector3.up, distToGround + 0.1); //raycast to detect surface
 }
 
 function resetGame() {
 
     	stopRecording();
     	
     	//loop through and destroy the ghosts
 	 	for (var i = 0; i<roundNumber; i++) { //loop through the ghosts
	 		Destroy(ghosts[i]); //destroy ghost
	 	}
     	
     	//reset round number
     	roundNumber = 0;
     	transform.position = startPosition;
     	
     	startRecording();
 }
 