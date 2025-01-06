async function initializeBudget() {
    const params = new URLSearchParams(document.location.search);

    if (!params.get("budgetMonth")) {
        const date = new Date;
        params.append("budgetMonth", `${date.toLocaleString("default", { month: "long" })}_${date.getFullYear()}`)
        window.location.replace(`/src/budget/budget.html?${params}`);
    }
    
    const currentBudget = await getCurrentBudget(params);

    const categoriesDB = new PouchDB("categories");
    let categoryResults = await categoriesDB.allDocs({ include_docs: true });
    if (categoryResults.total_rows === 0) {
        createNewCategoriesFromParams(params);
        categoryResults = await categoriesDB.allDocs({ include_docs: true });
    }
    
    const categories = categoryResults.rows.flatMap(c => c.doc).filter(c => c.category === undefined).sort((a, b) => a.order - b.order);
    const catDivs = [];
    for (let c = 0; c < categories.length; c++) {
        const subCategories = categoryResults.rows.flatMap(c => c.doc).filter(s => s.category === categories[c]._id).sort((a, b) => a.order - b.order);
        const subCategoryDivs = [];
        for (let s = 0; s < subCategories.length; s++) {
            subCategoryDivs.push(`
                <div class="sub-category">
                    <label for="${subCategories[s]._id}">${subCategories[s].name}</label>
                    <div class="money-input">
                        <label for="${subCategories[s]._id}">$</label>
                        <input id="${subCategories[s]._id}" type="number" placeholder="0.00" value="${currentBudget.find(c => c.id === subCategories[s]._id)?.value.toFixed(2) || "0.00"}" step="0.01" min="0" />
                    </div>
                </div>
            `);
        }
        catDivs.push(`
            <div class="category">
                <h3>${categories[c].name}</h3>
                <div>
                    ${subCategoryDivs.join('')}
                </div>
            </div>
        `);
    }

    document.getElementById("form-fields").innerHTML = catDivs.join('');
    document.getElementById("month").innerHTML = params.get("budgetMonth").split('_')[0];
    document.getElementById("year").innerHTML = params.get("budgetMonth").split('_')[1];
}

async function saveBudget(event) {
    event.preventDefault();
    const params = new URLSearchParams(document.location.search);
    const values = [...document.getElementsByTagName("input")].map(el => ({ id: el.id, value: parseFloat(el.value) })).filter(cat => cat.value !== 0);
    console.log(values)
    
    const budgetDB = new PouchDB("budgets");
    const budget = {
        "_id": params.get("budgetMonth"),
        "month": params.get("budgetMonth").slice('_')[0],
        "budget": values
    }
    budgetDB.put(budget);
}

async function createNewCategoriesFromParams(params) {
    const rawJSON = params.get("json");
    const json = JSON.parse(rawJSON);
    if (json.poisedBudgetVersion !== "0.0.1") {
        throw new Error("Poised Budget version does not match existing versions.")
    }
    
    const categoriesDB = new PouchDB("categories");
    const categories = json.categories;
    const docs = [];
    for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        const categroyID = generateID(category.name);
        const doc = {
            "_id": categroyID,
            "name": category.name,
            "order": category.order
        };

        docs.push(doc);
        
        for (let s = 0; s < category.sub_categories.length; s++) {
            const subCategory = category.sub_categories[s];
            const doc = {
                "_id": generateID(subCategory.name),
                "name": subCategory.name,
                "order": subCategory.order,
                "category": categroyID
            }

            docs.push(doc);
        }
    }

    const createResult = await categoriesDB.bulkDocs(docs);
    // An array indicating responses either [true], [true, undefined], or [undefined]
    const resultSet = [...new Set(createResult.flatMap((res) => res.ok))];
    if (resultSet.includes(undefined)) {
        throw new Error("Failed to save categories to DB.");
    }
}

function generateID(name) {
    return `${name.replaceAll(/\W/g, "_").toLowerCase()}${Math.floor(Math.random() * 1000)}`
}

function nextOrPreviousMonth(event, next = true) {
    event.preventDefault();
    const increment = next ? 1 : -1;

    const params = new URLSearchParams(document.location.search);
    const date = new Date(`${params.get("budgetMonth")}, 1 1970`);
    date.setMonth(date.getMonth() + increment);
    const budgetMonth = `${date.toLocaleString("default", { month: "long" })}_${date.getFullYear()}`;
    params.set("budgetMonth", budgetMonth);
    window.location.replace(`/src/budget/budget.html?${params}`);
}

async function getCurrentBudget(params) {
    const budgetDB = new PouchDB("budgets");

    try {
        return (await budgetDB.get(params.get("budgetMonth")))?.budget
    } catch (e) {
        if (e.message === "missing") {
            console.log("Could not find document. Loading empty budget...")
            return []
        }

        throw e
    }
}