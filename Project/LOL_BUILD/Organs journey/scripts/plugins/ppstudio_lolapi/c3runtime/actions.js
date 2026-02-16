"use strict";
/*Copyright (C) Angel Hernando Hernandez Rivera - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential.
Written by Angel Hernandez infoppstudio@imcsw.com, February 2020.*/
{
	const C3=globalThis.C3;
	C3.Plugins.ppstudio_lolapi.Acts =
	{		
		LoadingProgress(percent)
		{
			this._LoadingProgress(percent);
		},
		
		AutoProgress(){
			this.ValidateGameReady();

			if (this._currentProgress<this._maxProgress){
				this._currentProgress++;
				this.DebugConsoleLog("LoL API - Progress Submitted ==> "+this._currentProgress);
				this.LoLApi('progress', { 
							'currentProgress': this._currentProgress,
							'maximumProgress': this._maxProgress,
							'score': this._score
						});
			}
			else 
				this.DebugConsoleLog("LoL API - Max Progress reached! ==>"+this._currentProgress,this.PPSTUDIO_LOLAPI_C_WARNING);
				
		},
		
		SetScore(score){
			this.ValidateGameReady();

			this._score = score;
		},
		
		ResetProgress(){
			this._currentProgress = 0;
			this.DebugConsoleLog("LoL API - Progress reset. WARNING: Game Progress set back to Zero.",this.PPSTUDIO_LOLAPI_C_WARNING);
		},
		
		SetMaxProgress(max){
			this._maxProgress = Math.max(8,max);
			this.DebugConsoleLog("LoL API - Max Progress set to ==>"+this._currentProgress);			
		},
		
		SubmitGameProgress(step)
		{
			this.ValidateGameReady();
			if (this._currentProgress>step){
				//console.error("LoL API Error: Progress step submited:"+step+", is lower than Max Progress requiered: "+this._maxProgress);
				const msg="LoL API Warning: Progress step submited:"+step+", is lower than previous progress "+this._currentProgress+"\r\nLoL API requires you to NEVER DECREASE the progress while your game is running";

				this.DebugConsoleLog(msg,this.PPSTUDIO_LOLAPI_C_WARNING);

			}
			this._currentProgress=Math.min(step,this._maxProgress);
			
			this.LoLApi('progress', { 
										'currentProgress': step,
										'maximumProgress': this._maxProgress,
										'score': this._score
									});
			this.DebugConsoleLog("LoL API Progress Submitted ==>"+this._currentProgress);
		},

		ShowQuestion()
		{
			this.ValidateGameReady();
			this.DebugConsoleLog("Show Question Requested");
			this.LoLApi('showQuestion', "*");
		},

		LoadState()
		{
			this.ValidateGameReady();
			this.DebugConsoleLog("Load State Requested");
			this.LoLApi('loadState', "*");
		},

		SaveState(data)
		{
			this.ValidateGameReady();
			this.DebugConsoleLog("Save State Requested");
			this.LoLApi('saveState', 
				{
					"currentProgress":this._currentProgress,
					"maximumProgress":this._maxProgress,
					"data":data}
				);
		},		
		
		SpeakText(textToSpeak)
		{
			this.ValidateGameReady();
			this.DebugConsoleLog("Mute:"+this._mute);
			if (!this._mute)
				this.LoLApi('speakText', { "key": textToSpeak });
		},
		
		CompleteGame()
		{
			this.ValidateGameReady();
			if (this._GetPlayTime()<300000||this._GetPlayTime()>1500000){
				const msg="WARNING: LoL Games require a minimum of 5 minutes of gameplay, and a maximum of 15 minutes.";
				this.DebugConsoleLog(msg,this.PPSTUDIO_LOLAPI_C_WARNING);
			}

			if (this._currentProgress<8){
				const msg="ERROR: LoL API requires you to report at least 8 progress steps completed before calling the CompleteGame event.";

				this.DebugConsoleLog(msg,this.PPSTUDIO_LOLAPI_C_ERROR);

			}
			else
			{
				this.DebugConsoleLog("Game Completed. Step "+this._currentProgress+"/"+this._maxProgress);
				this.LoLApi('complete', {});
			}
		},
		
		GameIsReady(){		
			this.LoLApi("gameIsReady",{ 
					"aspectRatio": "16:9",
					"resolution": "1024x576"
				});
		},
		
		SetJSONFromString(lang,st){
			try{
				let temp = JSON.parse(st);
				
				this._languageTexts = temp[lang];
				this._lang = lang;
			}
			catch(e){
				this._lastError = e;
				this.DebugConsoleLog("ERROR: LoL API Lang file parsing error.\n"+e,this.PPSTUDIO_LOLAPI_C_ERROR);
				this.Trigger(self.C3.Plugins.ppstudio_lolapi.Cnds.OnError);
			}
		},
		
		SetHighlightColor(c){
			this._hgcolor = c;
		},
		
		Mute(){
			this._mute=true;
		},
		
		Unmute(){
			this._mute=false;
		},
		
		Suspend(){
			//this.GetRuntime()._suspendCount = 0; //Forcing the engine to stop
			this.runtime.sdk.setSuspended(true);
		}
	};
}