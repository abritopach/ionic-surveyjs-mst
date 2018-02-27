import { types, getEnv, applySnapshot } from 'mobx-state-tree';

const presentLoading = (self, message) => {
    let loading = getEnv(self).loading.create({
        content: message
    });
    loading.present();
    return loading;
}

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
        const loading = presentLoading(self, 'Loading Survey Results...');
        getEnv(self).surveyProvider.getSurveyResults(survey.Id)
		.subscribe(
			data => {
                let results = data.Data.map(obj => {
                    let userAnswers = Object.keys(obj).reduce((acc, currentValue, currentIndex) => {
                        if ((currentValue != "HappendAt") && (currentValue != "IPAddress")) acc.push({idQuestion: "P" + (currentIndex + 1), textQuestion: currentValue, value: obj[currentValue].toString()});
                        return acc;
                    }, []);
                    return {happendAt: obj.HappendAt, iPAddress: obj.IPAddress, userAnswers: userAnswers}
                });
                applySnapshot(self.results, results);
                loading.dismiss();
			},
			error => {
                console.log(<any>error);
                loading.dismiss();
			}
		);
    },
    makeSurveyResultsPublic(loadingContent, survey, allowAccessResult) {
        const loading = presentLoading(self, loadingContent);
        getEnv(self).surveyProvider.makeSurveyResultsPublic(survey.Id, allowAccessResult)
		.subscribe(
			data => {
				// console.log(data);
				loading.dismiss();
			},
			error => {
				// console.log(<any>error);
				loading.dismiss();
			}
		);
    }
})).views(self => ({
    getQuestions() {
        return self.results[0].userAnswers.map((val, key) => {return val['textQuestion']})
    },
    formatChartData() {
        const results = self.results;
        let userAnswers = [];
        // Concatenate all user's answers.
        results.map(result => { 
            userAnswers.push(...result.userAnswers)
        });

        // Group by answers by question.
        let data = userAnswers.reduce(function(rv, x) {
            (rv[x['idQuestion']] = rv[x['idQuestion']] || []).push(x.value);
            return rv;
            }, {});
        
        const chartData = Object.keys(data).map(i => data[i]);

        return chartData;
    }
}));

