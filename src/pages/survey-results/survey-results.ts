import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, AlertController } from 'ionic-angular';

import { SurveyProvider } from '../../providers/survey/survey';

import { ChartsModalPage } from '../../modals/charts-modal';

import { SurveyListResults } from '../../models/survey.results.mst.model';

import * as papa from 'papaparse';

import makeInspectable from 'mobx-devtools-mst';

/**
 * Generated class for the SurveyResultsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-results',
  templateUrl: 'survey-results.html',
})
export class SurveyResultsPage {

	currentYear = new Date().getFullYear();
	survey: any;
	chartData: any;
	surveyResults : any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public surveyProvider: SurveyProvider,
			  public loadingCtrl: LoadingController, public modalCtrl: ModalController, public alertCtrl: AlertController) {

		this.survey = this.navParams.get('survey');

		this.surveyResults = SurveyListResults.create({
			results: []
        }, {
			surveyProvider: this.surveyProvider, // inject provider to the tree.
			loading: loadingCtrl
		});
		
		// Allow inspecting MST root.
		makeInspectable(this.surveyResults);

        this.surveyResults.getSurveyResults(this.survey);
  }

  	ionViewDidLoad() {
		//console.log('ionViewDidLoad SurveyResultsPage');
	}

	openModal() {
		let modal = this.modalCtrl.create(ChartsModalPage, {'chartData': this.surveyResults.formatChartData(), 'questionsText': this.surveyResults.getQuestions()});
		modal.present();
	}

	onClickDeleteSurveyResult(result) {
		//console.log("onClickDeleteSurveyResult");
		console.log(result);
	}

	downloadResults() {
		let csv = papa.unparse({
			fields: this.surveyResults.getQuestions(),
			data: this.surveyResults.formatChartData()
		  });
	   
		  // Dummy implementation for Desktop download purpose.
		  // let blob = new Blob([csv]);
		  // Sent the UTF-8 header for the download process.
		  let blob = new Blob(["\ufeff", csv]);
		  let a = window.document.createElement("a");
		  a.href = window.URL.createObjectURL(blob);
		  a.download = "survey-results.csv";
		  document.body.appendChild(a);
		  a.click();
		  document.body.removeChild(a);
	}

	makeSurveyResultsPublic(content) {
		this.survey.changeAllowAccessResult();
		this.surveyResults.makeSurveyResultsPublic(content, this.survey, this.survey.AllowAccessResult);
	}

	presentAlert() {

		let operation;
		let loadingContent;
		if (this.survey.AllowAccessResult) {
			operation = "disable";
			loadingContent = "Making Survey results not public..."
		} 
		else {
			operation = "grant";
			loadingContent = "Making Survey results public...";
		} 
        let options = this.alertConfig(operation);
        let alert = this.alertCtrl.create({
          title: options.title,
          subTitle: options.subTitle,
          buttons: [
            {
                text: 'Cancel',
                handler: () => {
                }
            },
            {
              text: 'Accept',
              handler: () => {
				  this.makeSurveyResultsPublic(loadingContent);
              }
            }
          ]
        });
		alert.present();
	}
	
	alertConfig(operation) {
        let options = {
            grant: {title: 'Grant Access', subTitle: 'Your Survey results can be accessible via direct Url. ¿Are you sure to grant access?'},
            disable: {title: 'Disable Access', subTitle: 'Your Survey results can not be accessible via direct Url. ¿Are you sure to disable access?'},

        }
        return options[operation];
    }

}
