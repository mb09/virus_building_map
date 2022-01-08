let building_list_data = [];
const buildings = [];

const formatDates = (input)=>{
    return input.replaceAll(/(\(\d\))/g, (input)=>{return `\n${input}`}).replaceAll(/(（\d）)/g, (input)=>{return `\n${input}`}).replaceAll(/或\d/g, (input)=>{return `\n${input}`}).replaceAll(/及\d/g, (input)=>{return `\n${input}`}).replaceAll(/、\d/g, (input)=>{return `\n${input}`});
}

const crawlList = async() =>{
    
    const building_list_el = document.querySelector("#building_list");
    const suggestions = document.querySelector("#suggestions");

    const res = await fetch("https://services8.arcgis.com/PXQv9PaDJHzt8rp0/arcgis/rest/services/CompulsoryTestingBuilding_View2/FeatureServer/0/query?f=json&where=((Status_Cal%20LIKE%20%27%25Active%25%27))&orderByFields=Status%20ASC%2CDistrict_EN%20ASC&outFields=*&spatialRel=esriSpatialRelIntersects");
    const data = await res.json();


    building_list_data = data["features"].map(building => building["attributes"]);
    building_list_data.sort((a, b) => (a["GazetteDate_Date"] < b["GazetteDate_Date"]) ? 1 : -1)
    building_list_data.forEach(building =>{
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
        const deadline =  formatDates(building["Deadline_ZH"]);
        deadline_date.innerText = "檢測期限: " + deadline;
        deadline_date.classList.add("deadlineDate");
        
        const day_diff = Math.ceil((new Date() - new Date(building["GazetteDate_Date"])) / 86400000) - 1 ;
        const announce_date = document.createElement("div");
        announce_date.innerText = day_diff + "天前公布";
        announce_date.classList.add("announceDate");

        const building_el = document.createElement("li");
        building_el.append(name, period_date, deadline_date, announce_date);
        building_el.classList.add("building");
        building_el.classList.add((announce_date < Date.now()) ? "finished" : "ongoing");
        building_el.style.borderColor = `hsl(0,100%,${80 + (20 / 14 * day_diff)}%)`;

        building_list_el.append(building_el);
        buildings.push(building_el);

        const suggestion_el = document.createElement("option");
        suggestion_el.value = name.innerText;

        suggestions.appendChild(suggestion_el);
    })
}

const updateFilter = (e)=>{
    buildings.forEach(building => {
        if(building.innerText.includes(e.target.value)){
            building.classList.remove("hidden");
        }
        else{
            building.classList.add("hidden");
        }
    })

}

crawlList();

const filter = document.querySelector("#filter");
filter.addEventListener("input", updateFilter);
filter.value = "";