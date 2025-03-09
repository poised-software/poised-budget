import { getCurrentBudget, getCategories } from "../../node_modules/poised-budget-core/utils.js";

async function initializeBudget(password, editable = true) {
    const params = new URLSearchParams(document.location.search);

    if (!params.get("budgetMonth")) {
        const date = new Date;
        params.append("budgetMonth", `${date.toLocaleString("default", { month: "long" })}_${date.getFullYear()}`)
        window.location.replace(`${window.location.pathname}?${params}`);
    }

    const currentBudget = await getCurrentBudget(PouchDB, openpgp, params, password);
    const categoryResults = await getCategories(PouchDB, openpgp, params, password);

    const categories = categoryResults.filter(c => c.category === undefined).sort((a, b) => a.order - b.order);
    const catDivs = [];
    for (let c = 0; c < categories.length; c++) {
        const subCategories = categoryResults.filter(s => s.category === categories[c]._id).sort((a, b) => a.order - b.order);
        const subCategoryDivs = [];
        for (let s = 0; s < subCategories.length; s++) {
            if (editable) {
                subCategoryDivs.push(`
                    <div class="sub-category">
                        <label for="${subCategories[s]._id}">${subCategories[s].name}</label>
                        <div class="money-input">
                            <label for="${subCategories[s]._id}">$</label>
                            <input id="${subCategories[s]._id}" type="number" placeholder="0.00" value="${currentBudget.find(c => c.id === subCategories[s]._id)?.value.toFixed(2) || "0.00"}" step="0.01" min="0" />
                        </div>
                    </div>
                `);
            } else {
                subCategoryDivs.push(`
                    <div class="sub-category view-mode">
                        <p>${subCategories[s].name}</label>
                        <div class="budgetValues">
                            <p id="${subCategories[s]._id}_spent">Loading...</p>
                            <p class="subscript">$ ${currentBudget.find(c => c.id === subCategories[s]._id)?.value.toFixed(2) || "0.00"}</p>
                        </div>
                    </div>
                `);
            }
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

function nextOrPreviousMonth(event, next = true) {
    event.preventDefault();
    
    const increment = next ? 1 : -1;

    const params = new URLSearchParams(document.location.search);
    const date = new Date(`${params.get("budgetMonth")}, 1 1970`);
    date.setMonth(date.getMonth() + increment);
    const budgetMonth = `${date.toLocaleString("default", { month: "long" })}_${date.getFullYear()}`;
    params.set("budgetMonth", budgetMonth);
    window.location.replace(`${window.location.pathname}?${params}`);
}

export { initializeBudget, nextOrPreviousMonth }