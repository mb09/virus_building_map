let building_list_data = [];
const buildings = [];

const formatDates = (input) => {
    return input.replaceAll(/(\(\d\))/g, (input) => { return `\n${input}` }).replaceAll(/(（\d）)/g, (input) => { return `\n${input}` }).replaceAll(/:\d{2} \d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/g, (input) => { return input.split(" ").join("\n") }).replaceAll(/或\d/g, (input) => { return `\n${input}` }).replaceAll(/及\d/g, (input) => { return `\n${input}` }).replaceAll(/、\d/g, (input) => { return `\n${input}` });
}

const distinct = (value, index, self) =>{
    return self.indexOf(value) === index;
}

const crawlList = async () => {

    const title_suffix = document.querySelector("#title_suffix");
    const building_list_el = document.querySelector("#building_list");
    const suggestions = document.querySelector("#suggestions");
    const districts = document.querySelector("#districts");
    const dates = document.querySelector("#dates");

    const district_options = [];
    const date_options = [];

    let latest_amount = 0;
    let smallest_day_diff = 999999;
    let latest_date = "";

    const res = await fetch("https://services8.arcgis.com/PXQv9PaDJHzt8rp0/arcgis/rest/services/CompulsoryTestingBuilding_View2/FeatureServer/0/query?f=json&where=((Status_Cal%20LIKE%20%27%25Active%25%27))&orderByFields=Status%20ASC%2CDistrict_EN%20ASC&outFields=*&spatialRel=esriSpatialRelIntersects");
    const data = await res.json();

    building_list_data = data["features"].map(building => building["attributes"]);
    building_list_data.sort((a, b) => (a["GazetteDate_Date"] < b["GazetteDate_Date"]) ? 1 : -1)
    console.log(building_list_data[0]);

    building_list_data.forEach(building => {
        const name = document.createElement("a");
        name.innerText = `[${building["District_ZH"]}] ${building["SpecifiedPremises_ZH"]}`;
        name.href = building["URL_ZH"];
        name.target = "_blank";
        name.classList.add("name");

        const period_date = document.createElement("div");
        const period = formatDates(building["Period_ZH"]);
        period_date.innerText = "到訪日期: " + period;
        period_date.classList.add("periodDate");

        const deadline_date = document.createElement("div");
        const deadline = formatDates(building["Deadline_ZH"]);
        deadline_date.innerText = "檢測期限: " + deadline;
        deadline_date.classList.add("deadlineDate");

        const day_diff = Math.ceil((new Date() - new Date(building["GazetteDate_Date"])) / 86400000) - 1;
        const announce_date = document.createElement("div");
        if (day_diff == 0) {
            announce_date.innerText = "今天公布";
        }
        else if (day_diff == 1) {
            announce_date.innerText = "昨天公布";
        }
        else {
            announce_date.innerText = day_diff + "天前公布";
        }
        const date = building["GazetteDate"];
        announce_date.innerText += '\n'+ date;
        announce_date.classList.add("announceDate");

        date_options.push(date);

        if(day_diff < smallest_day_diff)
        {
            smallest_day_diff = day_diff;
            latest_amount = 1;
            latest_date = date;
        }
        else if(day_diff == smallest_day_diff)
        {
            latest_amount++;
        }

        const building_el = document.createElement("li");
        building_el.append(name, period_date, deadline_date, announce_date);
        building_el.classList.add("building");
        building_el.classList.add((day_diff <= 0) ? "today" : "previous");
        // building_el.style.borderColor = `hsl(0,100%,${80 + (20 / 14 * day_diff)}%)`;

        building_list_el.append(building_el);
        buildings.push(building_el);

        const suggestion_el = document.createElement("option");
        suggestion_el.value = name.innerText;

        suggestions.appendChild(suggestion_el);

        district_options.push(building["District_ZH"]);
    })

    district_options.filter(distinct).forEach(district =>{
        
        const district_suggestion_el = document.createElement("option");
        district_suggestion_el.value = district;
        district_suggestion_el.innerText = district;

        districts.appendChild(district_suggestion_el);
    })

    date_options.filter(distinct).forEach(date =>{
        
        const date_suggestion_el = document.createElement("option");
        date_suggestion_el.value = date;
        date_suggestion_el.innerText = date;

        dates.appendChild(date_suggestion_el);
    })

    title_suffix.innerText += ` ${latest_date} 新增 ${latest_amount} 處, 共 ${building_list_data.length} 處`
}


const updateFilter = () => {
    
    let keywords = filter.value.split(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]/g).filter((k)=>{
        return k.length > 0;
    });
    buildings.forEach(building => {
        building.classList.remove("hidden");

        let keywordMatch = false;
        keywords.forEach(keyword =>{
            if(building.innerText.includes(keyword)){
                keywordMatch = true;
            }
        })
        if (keywords.length > 0 && !keywordMatch) {
            building.classList.add("hidden");
        }
        if (! building.innerText.includes(dates.value)) {
            building.classList.add("hidden");
        }
        if (! building.innerText.includes(districts.value)) {
            building.classList.add("hidden");
        }
    })

}

const filter = document.querySelector("#filter");
filter.addEventListener("input", updateFilter);
filter.value = "";

const dates = document.querySelector("#dates");
dates.addEventListener("change", updateFilter);

const districts = document.querySelector("#districts");
districts.addEventListener("change", updateFilter);



crawlList();