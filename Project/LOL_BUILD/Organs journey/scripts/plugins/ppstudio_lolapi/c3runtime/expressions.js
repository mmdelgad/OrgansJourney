"use strict";
/*Copyright (C) Angel Hernando Hernandez Rivera - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited.
Proprietary and confidential.
Written by Angel Hernandez infoppstudio@imcsw.com, February 2020.*/
{
	const C3=globalThis.C3;
	C3.Plugins.ppstudio_lolapi.Exps =
	{	
		GetLanguage(){
			return this._lang||"none";
		},

		GetAlternativeText(index){
			return this._GetQAltField(this._qdataIndex,index,"text")||"";
		},

		GetAlternativeChoiceNum(index){
			return this._GetQAltField(this._qdataIndex,index,"choiceNum")||0;
		},

		GetAlternativeId(index){
			return this._GetQAltField(this._qdataIndex,index,"alternativeId")||-1;
		},

		GetQuestionIndex(){
			return this._qdataIndex;
		},

		GetAlternativeIndex(){
			return this._qaltIndex;
		},

		GetQuestionCount(){
			return this._questionData!==null?this._questionData.length:0;
		},

		GetQuestionStem(index){
			return this._GetQDataField(index,"stem");
		},

		GetQuestionId(index){
			return this._GetQDataField(index,"questionId");
		},

		GetQuestionImageURL(index){
			return this._GetQDataField(index,"imageURL")||"";
		},

		GetQuestionCorrectAltId(index){
			return this._GetQDataField(index,"correctAlternativeId");
		},

		GetError()
		{
			return this._lastError;
		},
		
		GetStateData(){
			return this._stateData;
		},

		//Retrieves a text string from JSON text file.
		GetText(id){
			try {
				this.DebugConsoleLog("LoL API - Text read ==> "+this._languageTexts[id]);
								
				let st=this._languageTexts[id]
				let hgSt = this._languageTexts["highlight"];
				let hg = null;

				if (!st) {
					this.DebugConsoleLog("ERROR: String id "+id+" was not found.",this.PPSTUDIO_LOLAPI_C_ERROR);
					return id;
				}

				if (hgSt===undefined||hgSt===null)
					return st;

				if (typeof hgSt=='string'){
					hgSt = hgSt.replace(/\'/g,"\"");
					try {
						hg=JSON.parse(hgSt);
					}
					catch(e){
						this._lastError = e;
						this.DebugConsoleLog("ERROR: LoL API parsing error. Invalid 'highlight' key in the lang file.\n"+e,this.PPSTUDIO_LOLAPI_C_ERROR);
						this.Trigger(self.C3.Plugins.ppstudio_lolapi.Cnds.OnError);		
						return st;
					}
				}
				else if (Array.isArray(hgSt)){
					hg = hgSt;
				}
				else
					return st; //Fallback on invalid 'highlight' key string.
									
				if (this._hgcolor){
					for (var a=0;a<hg.length;a++){
						var re=new RegExp(hg[a],"g");
						st=st.replace(re,"[color="+this._hgcolor+"]"+hg[a]+"[/color]");
					}
				}
				
				return st;
			}
			catch (e){
				this.DebugConsoleLog("Language:"+this._lang);
				//this.DebugConsoleLog("Payload:"+JSON.stringify(this._languageTexts));
				console.log(this._languageTexts);
				this.DebugConsoleLog(e);
				this._lastError = e;
				return "";
			}
		},
		
		//Retrieves a text string from JSON text file.
		GetRawText(id){
			try {
				this.DebugConsoleLog("LoL API - Text read ==> "+this._languageTexts[id]);
				
				var st=this._languageTexts[id];
				
				if (!st) return "";
				
				return st;
			}
			catch (e){
				this.DebugConsoleLog("Language:"+this._lang);
				this.DebugConsoleLog("Payload:"+JSON.stringify(this._languageTexts));
				//console.error(this._languageTexts);
				//this.DebugConsoleLog(e);
				this._lastError = e;
				return "";
			}
		},
		
		GetProgress(){
			return this._currentProgress;
		},
		
		GetMaxProgress(){
			return this._maxProgress;
		},

		GetPayload(){
			return JSON.stringify(this._languageTexts);
		},

		GetPlayTime(){
			return this._GetPlayTime();
		}
	};
}