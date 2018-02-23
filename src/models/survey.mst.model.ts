import { types, applySnapshot, getEnv, getParent, destroy, clone } from 'mobx-state-tree';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

const defaultImages = [
    "https://flexsurveys.com/wp-content/uploads/FlexSurveysEmployeeEngagementSurvey-Trans.png",
    "https://static.e-encuesta.com/wp-content/uploads/satisfaccion-cliente-v6.png",
    "http://www.redcresearch.ie/wp-content/uploads/2015/12/14.png",
    "http://www.redcresearch.ie/wp-content/uploads/2015/12/30.png"
];

export const Survey = types.model({
    AllowAccessResult: types.boolean,
    CreatedAt: types.string,
    CreatorId: types.string,
    Id: types.string,
    IsArchived: types.boolean,
    IsPublished: types.boolean,
    Name: types.string,
    PostId: types.string,
    PublishId: types.maybe(types.string),
    ResultId: types.string,
    StoreIPAddress: types.boolean,
    UseCookies: types.boolean,
    UserId: types.string,
    Image: types.optional(types.string, '')
}).actions(self => ({
    afterCreate() {
        // console.log('afterCreate Survey');
        self.Image = defaultImages[Math.floor(Math.random() * 4)];
    },
    remove() {
        getParent(self, 2).remove(self);
    }
}));

export const SurveyList = types.model({
    activeSurveys: types.optional(types.array(Survey), []),
    archiveSurveys: types.optional(types.array(Survey), [])
}).actions(self => ({
    getSurveys() {
        Observable.forkJoin(getEnv(self).surveyProvider.getActiveSurveys(), getEnv(self).surveyProvider.getArchiveSurveys())
            .subscribe(data => {
                // console.log(data);
                applySnapshot(self.activeSurveys, data[0]);
                applySnapshot(self.archiveSurveys, data[1]);
                getEnv(self).loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if ((error.message == "Failed to get surveys.") || (error.message == "Http failure response for (unknown url): 0 Unknown Error")) {};
                getEnv(self).loading.dismiss();
            });
    },
    addActive(survey) {
        self.activeSurveys.unshift(survey);
    },
    addArchive(survey) {
        self.archiveSurveys.unshift(survey);
    },
    remove(item) {
        destroy(item);
    },
    create(name) {
        console.log("create", name);
        getEnv(self).surveyProvider.createSurvey(name)
        .subscribe(
            data => {
                //console.log(data);
                let survey = Survey.create(data);
                (self as any).addActive(survey);
            },
            error => {
                console.log(<any>error);
            }
        );
    },
    delete(survey) {
        console.log("delete", survey.Id);
        getEnv(self).surveyProvider.deleteSurvey(survey.Id)
        .subscribe(
            data => {
                console.log(data);
            },
            error => {
                // API ERROR: Get status:200 with HttpErrorResponse.
                console.log(<any>error);
                if (error.status == 200) {
                    (survey as any).remove();
                }
            }
        );
    },
    activateSurvey(survey) {
        getEnv(self).surveyProvider.restoreSurvey(survey.Id)
        .subscribe(
            data => {
                console.log(data);
            },
            error => {
                console.log(<any>error);
                if (error.status == 200) {
                    let copy = clone(survey);
                    (survey as any).remove();
                    (self as any).addActive(copy);
                }
            }
        );
    },
    archiveSurvey(survey) {
        getEnv(self).surveyProvider.archiveSurvey(survey.Id)
        .subscribe(
            data => {
                console.log(data);
            },
            error => {
                console.log(<any>error);
                if (error.status == 200) {
                    let copy = clone(survey);
                    (survey as any).remove();
                    (self as any).addArchive(copy);
                }
            }
        );
    }
})).views(self => ({
    getActiveSurveysCount() {
        return self.activeSurveys.reduce((count, entry) => count + 1, 0);
    }
}));
