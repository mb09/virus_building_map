let building_list = [];

const crawlList = async() =>{
    
    const building_list_list = document.querySelector("#building_list");

    const res = await fetch("https://services8.arcgis.com/PXQv9PaDJHzt8rp0/arcgis/rest/services/CompulsoryTestingBuilding_View2/FeatureServer/0/query?f=json&where=((Status_Cal%20LIKE%20%27%25Active%25%27))&orderByFields=Status%20ASC%2CDistrict_EN%20ASC&outFields=*&spatialRel=esriSpatialRelIntersects");
    const data = await res.json();

    building_list = data["features"].map(building => building["attributes"]);
    building_list.sort((a, b) => (a["GazetteDate_Date"] < b["GazetteDate_Date"]) ? 1 : -1)

    building_list.forEach(building =>{
        const name = document.createElement("div");
        name.innerText = `[${building["District_ZH"]}] ${building["SpecifiedPremises_ZH"]}`;
        name.classList.add("name");

        const period_date = document.createElement("div");
        period_date.innerText = "到訪日期: " + building["Period_ZH"];
        period_date.classList.add("periodDate");
        
        const deadline_date = document.createElement("div");
        deadline_date.innerText = "檢測期限: " + building["Deadline_ZH"];
        deadline_date.classList.add("deadlineDate");
        
        const day_diff = Math.ceil((new Date() - new Date(building["GazetteDate_Date"])) / 86400000) -1 ;
        const announce_date = document.createElement("div");
        announce_date.innerText = day_diff + "天前公佈";
        announce_date.classList.add("announceDate");

        const building_el = document.createElement("li");
        building_el.append(name, period_date, deadline_date, announce_date);
        building_el.classList.add("building");
        building_el.classList.add((announce_date < Date.now()) ? "finished" : "ongoing");
        building_el.style.borderColor = `hsl(0,100%,${80 + (20 / 14 * day_diff)}%)`;

        building_list_list.append(building_el);
    })
}

crawlList();