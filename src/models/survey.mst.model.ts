import { types, flow, applySnapshot, getEnv } from 'mobx-state-tree';

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
    }
}));

export const SurveyList = types.model({
    activeSurveys: types.optional(types.array(Survey), []),
    archiveSurveys: types.optional(types.array(Survey), [])
}).actions(self => ({
    getSurveys() {
        Observable.forkJoin(getEnv(self).surveyProvider.getActiveSurveys(), getEnv(self).surveyProvider.getArchiveSurveys())
            .subscribe(data => {
                console.log(data);
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
    add(name) {
        getEnv(self).surveyProvider.createSurvey(name)
        .subscribe(
            data => {
                //console.log(data);
                let survey;
                applySnapshot(survey, data);
                self.activeSurveys.unshift(survey);
                getEnv(self).loading.dismiss();
            },
            error => {
                console.log(<any>error);
                getEnv(self).loading.dismiss();
            }
        );
    },
})).views(self => ({
    getActiveSurveysCount() {
        return self.activeSurveys.reduce((count, entry) => count + 1, 0);
    }
}));
