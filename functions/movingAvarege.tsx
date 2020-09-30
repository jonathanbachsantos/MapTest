export default (data: any, windowSize: any) => {
    let newData = [];

    for (var i = windowSize - 1; i < data.length; i++) {
        const averanges = {};

        for (let stat of ["New_cases", "New_deaths"]) {
            const curWindowData = data.slice(i - windowSize + 1, i + 1);

            const average = curWindowData.reduce((acc, cur) => cur[stat] + acc, 0) / windowSize;

            const keyName = "avg_" + stat;
            averanges[keyName] = Math.round(average);

        }

        newData.push({
            ...data[i],
            ...averanges
        });
    }

    return newData;
}