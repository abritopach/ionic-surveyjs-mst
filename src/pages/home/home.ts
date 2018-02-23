import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { SurveyProvider } from '../../providers/survey/survey';
import { SurveyDetailsPage } from '../survey-details/survey-details';

import { SurveyList } from '../../models/survey.mst.model';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    noSurveys: boolean = false;
    currentYear = new Date().getFullYear();
    surveys: any = [];


    constructor(public navCtrl: NavController, public surveyProvider: SurveyProvider,
                public loadingCtrl: LoadingController, public alertCtrl: AlertController) {

        let loading = this.loadingCtrl.create({
            content: "Loading Surveys..."
        });
        this.surveys = SurveyList.create({
            activeSurveys: [],
            archiveSurveys: []
        }, {
            surveyProvider: this.surveyProvider, // inject provider to the tree.
            loading: loading
        });

        this.surveys.getSurveys();
 
    }

    selectedSurvey(survey) {
        //console.log(survey);
        /*
        this.navCtrl.push(SurveyDetailsPage, {
            survey: survey
        });
        */
    }

    onClickCreateSurvey() {
        this.presentAlert(null, 'create');
    }

    onClickActivateSurvey(survey) {
        console.log("onClickActivateSurvey", survey);
        this.presentAlert(survey, 'activate');
    }

    onClickArchiveSurvey(survey) {
        console.log("onClickArchiveSurvey", survey);
        this.presentAlert(survey, 'archive');
    }

    onClickEditSurvey(survey) {
        console.log("onClickEditSurvey", survey);
        this.showPrompt(survey);
    }

    onClickDeleteSurvey(survey, type) {
        console.log("onClickDeleteSurvey", survey);
        this.presentAlert(survey, 'delete');
    }

    presentAlert(survey, operation) {
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
                if (operation == 'delete') this.deleteSurvey(survey);
                if (operation == 'activate') this.activateSurvey(survey);
                if (operation == 'archive') this.archiveSurvey(survey);
                if (operation == "create") this.createSurvey("New Survey :)");
              }
            }
          ]
        });
        alert.present();
    }

    showPrompt(survey) {
        let prompt = this.alertCtrl.create({
          title: 'Update Survey Name',
          message: "Enter a name for this survey",
          inputs: [
            {
              name: 'name',
              placeholder: 'Name'
            },
          ],
          buttons: [
            {
              text: 'Cancel',
              handler: data => {
              }
            },
            {
              text: 'Accept',
              handler: data => {
                this.changeSurveyName(survey, data.name);
              }
            }
          ]
        });
        prompt.present();
      }

    changeSurveyName(survey, newName) {
        /*
        let loading = this.loadingCtrl.create({
            content: "Updating Survey name..."
        });

        loading.present();

        this.surveyProvider.changeSurveyName(survey.Id, newName)
        .subscribe(
            data => {
                console.log(data);
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if (error.status == 200) survey.Name = newName;
                loading.dismiss();
            }
        );
        */
    }

    createSurvey(name) {
        this.surveys.create(name);
    }

    deleteSurvey(survey) {
        this.surveys.delete(survey);
    }

    activateSurvey(survey) {
        this.surveys.activateSurvey(survey);
    }

    archiveSurvey(survey) {
        this.surveys.archiveSurvey(survey);
    }

    removeElement(surveyId, surveys) {
        return surveys.filter(function(e) {
            return e.Id !== surveyId;
        });
    }

    alertConfig(operation) {
        let options = {
            delete: {title: 'Delete Survey', subTitle: '¿Are you sure to delete the survey?'},
            activate: {title: 'Activate Survey', subTitle: '¿Are you sure to activate the survey?'},
            archive: {title: 'Archive Survey', subTitle: '¿Are you sure to archive the survey?'},
            create: {title: 'Create Survey', subTitle: '¿Are you sure to create new survey?'}

        }
        return options[operation];
    }

}
