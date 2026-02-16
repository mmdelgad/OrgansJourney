"use strict";
/*Copyright (C) Angel Hernando Hernandez Rivera - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential.
Written by Angel Hernandez infoppstudio@imcsw.com, February 2020.*/
{
	const DOM_COMPONENT_ID = "ppstudio_lolapi_DOM";
	const C3 = globalThis.C3;
	
	C3.Plugins.ppstudio_lolapi.Instance = class ppstudio_lolapi_Instance extends globalThis.ISDKInstanceBase
	{
		
		constructor(inst, properties)
		{
			super({ domComponentId: DOM_COMPONENT_ID }); //Registering the DOM component for the 
			this.PPSTUDIO_LOLAPI_C_WARNING = 'warn';
			this.PPSTUDIO_LOLAPI_C_ERROR = 'error';
			this.PPSTUDIO_LOLAPI_C_INFO = 'info';

			this._ValidateAspectRatio();
			  
			// Initialise object properties
			this._globalDebugMode = false;
			this._timeElapsed = Date.now(); //Storing the starting time
			this._lastError = "";
			this._payload = {};
			this._hgcolor = "";
			this._lang="en";
			this._languageTexts={};
			this._score=0; //score data
			this._mute=false; //SpeakText muted flag
			this._maxProgress=8; //Game Max Progress
			this._currentProgress=0; //Game Progress
			this._stateData = ""; //Plugin State
			this._isGameReady=false; //LoL API ready flag
			this._questionData = null; //Questions array
			this._qdataIndex=-1; //Loop - question index
			this._qaltIndex=-1; //Loop - alternatives index
			console.log('%c░▒▓(%cLoL%c)▓▒░API %cPowered by Pixel Perfect Studio©\n%cWebSite: https://www.pixelperfectstudio.mx',
				'color: orange; font-weight: bold; background-color:red; font-size:18px',
				'color: orange; font-weight: bold; background-color:black; font-size:18px',
				'color: orange; font-weight: bold; background-color:red; font-size:18px',
				'color: purple; font-weight: bold; background-color:plum; font-size:18px',
                'color: yellow; font-weight: bold; background-color:blue; ',
            );
			
			if (properties)		// note properties may be null in some cases
			{
				this._globalDebugMode = properties[0];
			}
			
			if (!this.runtime.isInWorker&&this._globalDebugMode)
				self["lolc3"]=this;
			
			/* Registering DOM message handlers for DOM responses posted to the runtime */
			this._addDOMMessageHandler("lol-lang",(d)=>{
				
					this._languageTexts = d["payload"];
					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.Language);}
				);
				
			this._addDOMMessageHandler("lol-start",(d)=>{
					this._lang = d["lang"];
					this._currentProgress=0;
					this._isGameReady=true;
					this._timeElapsed = Date.now(); //Resetting the starttime to now.
					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.Start);
				});

			this._addDOMMessageHandler("lol-on-error",
				(d)=>{
					this._lastError = d["msg"];
					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnError);
				}
			);
			this._addDOMMessageHandler("lol-pause",(d)=>{this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.Pause);});
			this._addDOMMessageHandler("debug",(d)=>{this.DebugConsoleLog(d["message"]);});
			this._addDOMMessageHandler("lol-resume",
				(d)=>{				
					this.runtime.sdk.setSuspended(false);
					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.Resume);
				}
			);

			this._addDOMMessageHandler("load-state",
				(d)=>{
					this._stateData = d["payload"]===null?"":d["payload"]["data"];
					
					if (d["payload"]!==null){
						this._currentProgress=d["payload"]["currentProgress"]!==undefined?
							(d["payload"]["currentProgress"]!==null?d["payload"]["currentProgress"]:0):0;

						this._maxProgress=d["payload"]["maximumProgress"]!==undefined?
							(d["payload"]["maximumProgress"]!==null?d["payload"]["maximumProgress"]:8):8; //Minimum progress required by LoL
					}
					else {
						this._currentProgress = 0;
						this._maxProgress = 8; //Minimum progress required by LoL
					}

					//Submitting the payload received from LoL API
					this.LoLApi('progress', 
					{ 
						'currentProgress': this._currentProgress,
						'maximumProgress': this._maxProgress
					});

					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnLoadState);
				}
			);

			this._addDOMMessageHandler("lol-question",
				(d)=>{
					this._questionData = d["payload"]["questions"];
					this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.Questions);
				}
			);

			this._addDOMMessageHandler("save-state-result",
				(d)=>{
					if (d["payload"]["result"])
						this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnSaveCompleted);
					else{
						this._lastError = "Error LoL API: \n"+JSON.stringify(d["payload"]);
						this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnError);
					}
				}
			);

			this._addDOMMessageHandler("question-answered",
				(d)=>{
					this.DebugConsoleLog("Answer: \n"+JSON.stringify(d));
					if (d["payload"]["isCorrect"]===true)
						this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnCorrectAnswer);
					else
						this._trigger(C3.Plugins.ppstudio_lolapi.Cnds.OnIncorrectAnswer);
				}
			);
		}

		DebugConsoleLog(msg,type){
			if (this._globalDebugMode||type==this.PPSTUDIO_LOLAPI_C_ERROR){
				switch(type){
					case this.PPSTUDIO_LOLAPI_C_ERROR: console.error(msg);break;
					case this.PPSTUDIO_LOLAPI_C_WARNING: console.warn(msg);break;
					default: console.log(msg); break;
				}
			}
		}
		
		_release()
		{
			super._release();
		}
		
		_saveToJson()
		{
			return {
				// data to be saved for savegames
			};
		}
		
		_loadFromJson(o)
		{
			// load state for savegames
		}

		_IsGameReady(){return this._isGameReady}

		ValidateGameReady(){
			if (!this._IsGameReady())
				if (this._globalDebugMode)
					console.warn("LoL API Plugin: Game is not ready, API can't execute commands. Make sure to call GameIsReady before any API call.");
				else
					console.error("LoL API Plugin: Game is not ready, API can't execute commands. Make sure to call GameIsReady before any API call.");
		}
		
		_getDebuggerProperties(){
			const prefix = "plugins.ppstudio_lolapi.debugger.";

			let values = [{
				title:prefix+"lol-name",
				properties:[
					{name: prefix+"progress", value:this._currentProgress},
					{name: prefix+"max-progress", value:this._maxProgress},
					//{name: prefix+"last-msg-sent", value:this._messageSent},
					{name: prefix+"language", value: this._lang},
					{name: prefix+"lang-texts", value: JSON.stringify(this._languageTexts,null,"\n\r")},
					{name: prefix+"last-error", value: this._lastError},
					{name: prefix+"hg-color", value: this._hgcolor},
					{name: prefix+"state-data", value: this._stateData}
				]
			}];
			return values;			
		}
		
		LoLApi(messageName, payloadObj) 
		{
			const data = {
				"messageName":messageName,
				"payloadObj":payloadObj
			}
			
			this._postToDOM("lol-api", data);
		}
		
		_LoadingProgress(percent){
		// Percent must be expressed in decimals, Eg. 0.5 = 50%, 1.0 = 100%
			const data = {
				"messageName":"loadingProgress",
				"percent":percent
			}
			
			this._postToDOM("lol-api", data);
		}
		
		_GetQDataField(index,field){
			return this._questionData[index][field];
		}

		_GetQAltField(index,altIndex,field){
			return this._questionData[index]["alternatives"][altIndex][field];
		}

		_ValidateAspectRatio(){
			const wratio=Math.floor(this.runtime.viewportWidth/16);
			const vratio=Math.floor(this.runtime.viewportHeight/9);

			if (wratio!==vratio){
				const msg="GAME HALTED: Invalid Aspect ratio. LoL Games require a 16:9 aspect ratio. Correct your viewport size. \nExamples of valid Viewport sizes: 1600x900, 1024x576, 854x477, 800x450";
				this.DebugConsoleLog(msg,this.PPSTUDIO_LOLAPI_C_ERROR);
				/*if (this._globalDebugMode){
					this._postToDOM("alert", {"msg":msg});
				}*/

				throw(msg);
			}
		}

		_GetPlayTime(){
			return Date.now()-this._timeElapsed;
		}
	};
}