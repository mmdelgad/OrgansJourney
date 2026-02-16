"use strict";
/*Copyright (C) Angel Hernando Hernandez Rivera - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential.
Written by Angel Hernandez infoppstudio@imcsw.com, February 2020.*/
{
	const C3=globalThis.C3;
	C3.Plugins.ppstudio_lolapi.Cnds =
	{	
		Start()
		{
			return true;
		},
		
		Language()
		{
			return true;
		},
		
		Questions()
		{
			return true;
		},
		
		Pause()
		{
			return true;
		},
		
		Resume()
		{
			return true;
		},
		
		OnError(){
			return true;
		},

		OnLoadState(){
			return true;
		},

		IsGameReady(){
			return this._IsGameReady();
		},

		OnSaveCompleted(){
			return true;
		},

		ForEachQuestion(){
			//Deprecated
			return false;
		},

		ForEachAlternative(index){
			//Deprecated
			return false;
		},

		IsAlternativeCorrect(qindex,altindex){
			return this._GetQAltField(qindex,altindex,"isCorrect")===true;
		},

		OnCorrectAnswer(){
			return true;
		},

		OnIncorrectAnswer(){
			return true;
		}
	};
}