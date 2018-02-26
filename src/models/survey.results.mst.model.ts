import { types, getEnv, applySnapshot } from 'mobx-state-tree';

export const UserAnswer = types.model({
    idQuestion: types.string,
    textQuestion: types.string,
    value: types.string
});

export const SurveyResult = types.model({
    happendAt: types.string,
    iPAddress: types.string,
    userAnswers: types.optional(types.array(UserAnswer), [])
}).actions(self => ({
}));

export const SurveyListResults = types.model({
    results: types.optional(types.array(SurveyResult), [])
}).actions(self => ({
    getSurveyResults(survey) {
        getEnv(self).surveyProvider.getSurveyResults(survey.Id)
		.subscribe(
			data => {
                let results = [];
                data.Data.map(obj => {
                    let result = {happendAt: obj.HappendAt, iPAddress: obj.IPAddress, userAnswers: []};
                    let index = 1;
                    for (let key in obj) {
                        let value = obj[key];
                        if ((key != "HappendAt") && (key != "IPAddress")) {
                            let userAnswer = {idQuestion: "P" + index, textQuestion: key, value: value.toString()};
                            result.userAnswers.push(userAnswer);
                        }
                    }
                    results.push(result);
                });
                applySnapshot(self.results, results);
			},
			error => {
				console.log(<any>error);
			}
		);
    }
}));

