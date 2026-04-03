document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculate');
    const resetButton = document.getElementById('reset');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const goalSelect = document.getElementById('goal');
    const activitySelect = document.getElementById('activity');
    const bmiResultDiv = document.getElementById('bmi-result');
    const nutritionalPlanDiv = document.getElementById('nutritional-plan');

    // Language switching functionality will be added in a later step

    calculateButton.addEventListener('click', () => {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const age = parseInt(ageInput.value);
        const gender = genderSelect.value;
        const goal = goalSelect.value;
        const activity = activitySelect.value;

        // Basic validation
        if (isNaN(weight) || weight <= 0) {
            alert(getTranslation('errorWeight'));
            weightInput.focus();
            return;
        }
        if (isNaN(height) || height <= 0) {
            alert(getTranslation('errorHeight'));
            heightInput.focus();
            return;
        }
        if (isNaN(age) || age < 2 || age > 120) { // Updated age validation
            alert(getTranslation('errorAge'));
            ageInput.focus();
            return;
        }

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const ageNum = parseInt(age); // Ensure age is a number for comparisons

        const categoryResult = determineBmiCategory(bmi, ageNum); // Contains message and key
        const healthRisks = calculateHealthRisks(bmi, ageNum, gender);

        bmiResultDiv.innerHTML = `<p>${getTranslation('bmiResultLabel')} <strong>${bmi.toFixed(2)}</strong></p>`;
        bmiResultDiv.innerHTML += `<p>${getTranslation('bmiCategoryLabel')} <strong>${getTranslation(categoryResult.key)}</strong></p>`; // Using translated category message

        if (healthRisks.length > 0) {
            bmiResultDiv.innerHTML += `<h4 data-translate="healthConsiderations">${getTranslation('healthConsiderations')}</h4><ul>`;
            healthRisks.forEach(riskKey => { // Assuming riskKey is the translation key
                bmiResultDiv.innerHTML += `<li>${getTranslation(riskKey)}</li>`;
            });
            bmiResultDiv.innerHTML += `</ul>`;
        }
         bmiResultDiv.innerHTML += `<p><small data-translate="bmiDisclaimer">${getTranslation('bmiDisclaimer')}</small></p>`;


        generateNutritionalPlan(bmi, ageNum, gender, activity, goal, weight); // Pass weight for macro calculation
    });

    resetButton.addEventListener('click', () => {
        weightInput.value = '';
        heightInput.value = '';
        ageInput.value = '';
        genderSelect.value = 'male';
        goalSelect.value = 'lose';
        activitySelect.value = 'sedentary';
        bmiResultDiv.innerHTML = '';
        nutritionalPlanDiv.innerHTML = '';
        weightInput.placeholder = getTranslation('weightPlaceholder', { defaultValue: "Enter your weight" });
        heightInput.placeholder = getTranslation('heightPlaceholder', { defaultValue: "Enter your height" });
        ageInput.placeholder = getTranslation('agePlaceholder', { defaultValue: "Enter your age" });
    });

    function determineBmiCategory(bmiValue, age) {
        let key;
        if (bmiValue < 16) key = 'bmiSevereThinness';
        else if (bmiValue < 17) key = 'bmiModerateThinness';
        else if (bmiValue < 18.5) key = 'bmiMildThinness';
        else if (bmiValue < 25) key = 'bmiNormal';
        else if (bmiValue < 30) key = 'bmiOverweight';
        else if (bmiValue < 35) key = 'bmiObeseClass1';
        else if (bmiValue < 40) key = 'bmiObeseClass2';
        else key = 'bmiObeseClass3';

        let message = getTranslation(key);
        if (age && age < 18 && age >=2) { // Added age check based on App.js (2-120)
            message += ` (${getTranslation('childBMIConsult')})`;
        }
        return { key: key, message: message }; // Return both key and full message
    }

    function calculateHealthRisks(bmiValue, age, gender) {
        const risks = []; // Store translation keys
        if (bmiValue < 18.5) {
            risks.push('riskNutritionalDeficiencies');
            risks.push('riskWeakenedImmuneSystem');
            if (bmiValue < 16) risks.push('riskSevereHealthComplications');
        } else if (bmiValue >= 25 && bmiValue < 30) {
            risks.push('riskIncreasedHeartDisease');
            risks.push('riskHigherType2Diabetes');
        } else if (bmiValue >= 30) {
            risks.push('riskHighHeartDiseaseStroke');
            risks.push('riskHighType2Diabetes');
            risks.push('riskIncreasedCertainCancers');
            if (bmiValue >= 40) risks.push('riskSevereHealthComplications'); // Re-use
        }

        if (age) {
            if (age < 18 && age >= 2 && bmiValue > 30) risks.push('riskEarlyOnsetDiabetes');
            else if (age > 65 && bmiValue < 22) risks.push('riskHigherFrailtyFalls');
        }

        if (gender === 'female' && bmiValue < 18.5) {
            risks.push('riskPotentialReproductiveIssues');
        }
        return risks;
    }

    // BMR Calculation using Mifflin-St Jeor Equation (already present, just for reference)
    // function calculateBMR(weight, height, age, gender) { ... }

    // TDEE Calculation (already present, just for reference)
    // function calculateTDEE(bmr, activityLevel) { ... }

    // Target Calories Calculation (adjust 'loss' and 'gain' from nutritionalCalculator.js if different)
    // function calculateTargetCalories(tdee, goal) { ... } // Current script.js uses -500 for lose, +500 for gain. nutritionalCalculator.js uses -500 and +300. Sticking to current script.js version for now.

    // Macronutrient Calculation - Ported from nutritionalCalculator.js
    function calculateMacros(targetCalories, weight) {
      // Protein: 1.8g/kg of body weight is a common athletic recommendation.
      // General population might be 0.8g/kg to 1.2g/kg.
      // Let's use a percentage-based approach for simplicity, similar to original script.js, but calculate grams.
      // Or use the 1.8g/kg and check if it fits reasonable percentages.
      // For now, using the logic from nutritionalCalculator.js:
      const proteinGrams = 1.8 * weight; // weight is expected in kg
      const proteinCalories = proteinGrams * 4;

      const fatPercentage = 0.25; // 25% of total calories from fat
      const fatCalories = targetCalories * fatPercentage;
      const fatGrams = fatCalories / 9;

      const carbCalories = targetCalories - proteinCalories - fatCalories;
      const carbGrams = carbCalories / 4;

      // Ensure carbs are not negative if protein is very high
      if (carbGrams < 0) {
        // This would be an edge case, could adjust protein down or signal an issue.
        // For now, let's assume inputs lead to reasonable positive carb grams.
         return {
            protein: Math.round(proteinGrams),
            fat: Math.round(fatGrams),
            carbs: 0, // Or handle this scenario more gracefully
            error: getTranslation('macroErrorProteinTooHigh')
        };
      }

      return {
        protein: Math.round(proteinGrams),
        fat: Math.round(fatGrams),
        carbs: Math.round(carbGrams)
      };
    }

    function generateNutritionalPlan(bmi, age, gender, activity, goal, currentWeight) { // Added currentWeight
        let bmr;
        const currentHeight = parseFloat(heightInput.value);

        if (isNaN(currentWeight) || isNaN(currentHeight) || isNaN(age)) {
            nutritionalPlanDiv.innerHTML = `<p>${getTranslation('errorMissingDataForPlan')}</p>`;
            return;
        }

        if (gender === 'male') {
            bmr = 10 * currentWeight + 6.25 * currentHeight - 5 * age + 5;
        } else { // female
            bmr = 10 * currentWeight + 6.25 * currentHeight - 5 * age - 161;
        }

        let tdee;
        switch (activity) {
            case 'sedentary': tdee = bmr * 1.2; break;
            case 'light': tdee = bmr * 1.375; break;
            case 'moderate': tdee = bmr * 1.55; break;
            case 'active': tdee = bmr * 1.725; break;
            case 'extra': tdee = bmr * 1.9; break;
            default: tdee = bmr * 1.2;
        }

        let dailyCalories;
        switch (goal) {
            case 'lose': dailyCalories = tdee - 500; break;
            case 'maintain': dailyCalories = tdee; break;
            case 'gain': dailyCalories = tdee + 500; break; // Kept +/- 500 as in original script.js
            default: dailyCalories = tdee;
        }

        if (dailyCalories < 1200 && gender === 'female') dailyCalories = 1200;
        else if (dailyCalories < 1500 && gender === 'male') dailyCalories = 1500;

        const macros = calculateMacros(dailyCalories, currentWeight);

        let macroHtml = '';
        if (macros.error) {
            macroHtml = `<p>${macros.error}</p>`;
        } else {
            macroHtml = `
                <ul>
                    <li>${getTranslation('proteinLabel')} ~${macros.protein}g</li>
                    <li>${getTranslation('carbsLabel')} ~${macros.carbs}g</li>
                    <li>${getTranslation('fatsLabel')} ~${macros.fat}g</li>
                </ul>
            `;
        }

        nutritionalPlanDiv.innerHTML = `
            <h3 data-translate="nutritionalPlanTitle">${getTranslation('nutritionalPlanTitle')}</h3>
            <p>${getTranslation('estimatedDailyCalories')} <strong>${Math.round(dailyCalories)} kcal</strong></p>
            <h4 data-translate="macronutrientDistribution">${getTranslation('macronutrientDistribution')}</h4>
            ${macroHtml}
            <p data-translate="planDisclaimer">${getTranslation('planDisclaimer')}</p>
        `;
        if (typeof updateTranslations === 'function') {
            updateTranslations(); // To translate any newly added data-translate attributes if needed.
        }
    }

    // --- I18n ---
    const translations = {
        en: {
            title: "BMI Health Calculator & Nutritional Plan",
            weightLabel: "Weight (kg):",
            heightLabel: "Height (cm):",
            ageLabel: "Age:",
            genderLabel: "Gender:",
            maleOption: "Male",
            femaleOption: "Female",
            goalLabel: "Select Your Goal:",
            loseWeightOption: "Lose Weight",
            maintainWeightOption: "Maintain Weight",
            gainWeightOption: "Gain Weight",
            activityLabel: "Select Your Activity Level:",
            sedentaryOption: "Sedentary (little or no exercise)",
            lightActivityOption: "Lightly active (light exercise/sports 1-3 days/week)",
            moderateActivityOption: "Moderately active (moderate exercise/sports 3-5 days/week)",
            activeActivityOption: "Very active (hard exercise/sports 6-7 days a week)",
            extraActiveActivityOption: "Extra active (very hard exercise/sports & physical job)",
            calculateButton: "Calculate",
            resetButton: "Reset",
            resultsTitle: "Results",
            aboutTitle: "About BMI & Nutritional Plan",
            aboutText: "Body Mass Index (BMI) is a measure of body fat based on height and weight that applies to adult men and women. Our nutritional plan provides recommendations based on your BMI, activity level, and goals. It's important to consult with a healthcare professional before making significant changes to your diet or exercise routine.",
            footerText: "&copy; 2023 BMI Health Calculator",
            errorWeight: "Please enter a valid weight.",
            errorHeight: "Please enter a valid height.",
            errorAge: "Please enter a valid age (2-120).", // Updated age error
            bmiResultLabel: "Your BMI is:",
            bmiCategoryLabel: "Category:",
            nutritionalPlanTitle: "Nutritional Plan Suggestion",
            estimatedDailyCalories: "Estimated Daily Caloric Intake:",
            planDisclaimer: "This is a general guideline. For a personalized plan, please consult a nutritionist or healthcare provider. Ensure you stay hydrated and include a variety of fruits, vegetables, lean proteins, and whole grains in your diet.",
            weightPlaceholder: "Enter your weight",
            heightPlaceholder: "Enter your height",
            agePlaceholder: "Enter your age",
            errorMissingDataForPlan: "Cannot generate plan, missing input data.",

            // New/Updated BMI Categories from App.js
            bmiSevereThinness: "Severe Thinness",
            bmiModerateThinness: "Moderate Thinness",
            bmiMildThinness: "Mild Thinness",
            bmiNormal: "Normal",
            bmiOverweight: "Overweight",
            bmiObeseClass1: "Obese Class I",
            bmiObeseClass2: "Obese Class II",
            bmiObeseClass3: "Obese Class III",
            childBMIConsult: "(Child BMI - consult pediatrician)",

            // Health Risks from App.js
            healthConsiderations: "Health Considerations:",
            riskNutritionalDeficiencies: "Potential nutritional deficiencies",
            riskWeakenedImmuneSystem: "Weakened immune system",
            riskSevereHealthComplications: "Severe health complications",
            riskIncreasedHeartDisease: "Increased risk of developing heart disease",
            riskHigherType2Diabetes: "Higher risk of type 2 diabetes",
            riskHighHeartDiseaseStroke: "High risk of heart disease and stroke",
            riskHighType2Diabetes: "High risk of type 2 diabetes", // Matches App.js key
            riskIncreasedCertainCancers: "Increased risk of certain cancers",
            riskEarlyOnsetDiabetes: "Risk of early onset diabetes",
            riskHigherFrailtyFalls: "Higher risk of frailty and falls",
            riskPotentialReproductiveIssues: "Potential reproductive health issues",
            bmiDisclaimer: "Note: This is general guidance. Please consult a healthcare professional for personalized advice.",

            // Nutritional Plan - Macros
            macronutrientDistribution: "Suggested Macronutrient Distribution (approximate grams):",
            proteinLabel: "Protein:",
            carbsLabel: "Carbohydrates:",
            fatsLabel: "Fats:",
            macroErrorProteinTooHigh: "Macro calculation error: Protein intake is too high for the estimated calorie goal. Please review inputs or consult a professional."
        },
        pt: {
            title: "Calculadora de IMC e Plano Nutricional",
            weightLabel: "Peso (kg):",
            heightLabel: "Altura (cm):",
            ageLabel: "Idade:",
            genderLabel: "Gênero:",
            maleOption: "Masculino",
            femaleOption: "Feminino",
            goalLabel: "Selecione Seu Objetivo:",
            loseWeightOption: "Perder Peso",
            maintainWeightOption: "Manter Peso",
            gainWeightOption: "Ganhar Peso",
            activityLabel: "Selecione Seu Nível de Atividade:",
            sedentaryOption: "Sedentário (pouco ou nenhum exercício)",
            lightActivityOption: "Levemente ativo (exercício leve/esportes 1-3 dias/semana)",
            moderateActivityOption: "Moderadamente ativo (exercício moderado/esportes 3-5 dias/semana)",
            activeActivityOption: "Muito ativo (exercício pesado/esportes 6-7 dias/semana)",
            extraActiveActivityOption: "Extra ativo (exercício muito pesado/esportes e trabalho físico)",
            calculateButton: "Calcular",
            resetButton: "Resetar",
            resultsTitle: "Resultados",
            aboutTitle: "Sobre o IMC e Plano Nutricional",
            aboutText: "O Índice de Massa Corporal (IMC) é uma medida da gordura corporal baseada na altura e no peso que se aplica a homens e mulheres adultos. Nosso plano nutricional fornece recomendações com base no seu IMC, nível de atividade e objetivos. É importante consultar um profissional de saúde antes de fazer alterações significativas em sua dieta ou rotina de exercícios.",
            footerText: "&copy; 2023 Calculadora de IMC",
            errorWeight: "Por favor, insira um peso válido.",
            errorHeight: "Por favor, insira uma altura válida.",
            errorAge: "Por favor, insira uma idade válida (2-120).",
            bmiResultLabel: "Seu IMC é:",
            bmiCategoryLabel: "Categoria:",
            nutritionalPlanTitle: "Sugestão de Plano Nutricional",
            estimatedDailyCalories: "Ingestão Calórica Diária Estimada:",
            planDisclaimer: "Esta é uma orientação geral. Para um plano personalizado, consulte um nutricionista ou profissional de saúde. Certifique-se de manter-se hidratado e incluir uma variedade de frutas, vegetais, proteínas magras e grãos integrais em sua dieta.",
            weightPlaceholder: "Digite seu peso",
            heightPlaceholder: "Digite sua altura",
            agePlaceholder: "Digite sua idade",
            errorMissingDataForPlan: "Não é possível gerar o plano, dados de entrada ausentes.",

            // BMI Categories - PT
            bmiSevereThinness: "Magreza Grave",
            bmiModerateThinness: "Magreza Moderada",
            bmiMildThinness: "Magreza Leve",
            bmiNormal: "Normal",
            bmiOverweight: "Sobrepeso",
            bmiObeseClass1: "Obesidade Classe I",
            bmiObeseClass2: "Obesidade Classe II",
            bmiObeseClass3: "Obesidade Classe III",
            childBMIConsult: "(IMC Infantil - consulte um pediatra)",

            // Health Risks - PT
            healthConsiderations: "Considerações de Saúde:",
            riskNutritionalDeficiencies: "Potenciais deficiências nutricionais",
            riskWeakenedImmuneSystem: "Sistema imunológico enfraquecido",
            riskSevereHealthComplications: "Complicações graves de saúde",
            riskIncreasedHeartDisease: "Risco aumentado de doenças cardíacas",
            riskHigherType2Diabetes: "Risco aumentado de diabetes tipo 2",
            riskHighHeartDiseaseStroke: "Alto risco de doenças cardíacas e derrame",
            riskHighType2Diabetes: "Alto risco de diabetes tipo 2",
            riskIncreasedCertainCancers: "Risco aumentado de certos tipos de câncer",
            riskEarlyOnsetDiabetes: "Risco de diabetes de início precoce",
            riskHigherFrailtyFalls: "Maior risco de fragilidade e quedas",
            riskPotentialReproductiveIssues: "Potenciais problemas de saúde reprodutiva",
            bmiDisclaimer: "Nota: Esta é uma orientação geral. Consulte um profissional de saúde para aconselhamento personalizado.",

            // Nutritional Plan - Macros - PT
            macronutrientDistribution: "Distribuição Sugerida de Macronutrientes (gramas aproximadas):",
            proteinLabel: "Proteína:",
            carbsLabel: "Carboidratos:",
            fatsLabel: "Gorduras:",
            macroErrorProteinTooHigh: "Erro no cálculo de macros: A ingestão de proteína é muito alta para o objetivo calórico estimado. Revise os dados ou consulte um profissional."
        },
        es: {
            title: "Calculadora de IMC y Plan Nutricional",
            weightLabel: "Peso (kg):",
            heightLabel: "Altura (cm):",
            ageLabel: "Edad:",
            genderLabel: "Género:",
            maleOption: "Masculino",
            femaleOption: "Femenino",
            goalLabel: "Seleccione Su Objetivo:",
            loseWeightOption: "Perder Peso",
            maintainWeightOption: "Mantener Peso",
            gainWeightOption: "Ganar Peso",
            activityLabel: "Seleccione Su Nivel de Actividad:",
            sedentaryOption: "Sedentario (poco o ningún ejercicio)",
            lightActivityOption: "Ligeramente activo (ejercicio ligero/deportes 1-3 días/semana)",
            moderateActivityOption: "Moderadamente activo (ejercicio moderado/deportes 3-5 días/semana)",
            activeActivityOption: "Muy activo (ejercicio intenso/deportes 6-7 días a la semana)",
            extraActiveActivityOption: "Extra activo (ejercicio muy intenso/deportes y trabajo físico)",
            calculateButton: "Calcular",
            resetButton: "Reiniciar",
            resultsTitle: "Resultados",
            aboutTitle: "Sobre el IMC y Plan Nutricional",
            aboutText: "El Índice de Masa Corporal (IMC) es una medida de la grasa corporal basada en la altura y el peso que se aplica a hombres y mujeres adultos. Nuestro plan nutricional proporciona recomendaciones basadas en su IMC, nivel de actividad y objetivos. Es importante consultar a un profesional de la salud antes de realizar cambios significativos en su dieta o rutina de ejercicios.",
            footerText: "&copy; 2023 Calculadora de IMC",
            errorWeight: "Por favor, ingrese un peso válido.",
            errorHeight: "Por favor, ingrese una altura válida.",
            errorAge: "Por favor, ingrese una edad válida (2-120).",
            bmiResultLabel: "Su IMC es:",
            bmiCategoryLabel: "Categoría:",
            nutritionalPlanTitle: "Sugerencia de Plan Nutricional",
            estimatedDailyCalories: "Ingesta Calórica Diaria Estimada:",
            planDisclaimer: "Esta es una guía general. Para un plan personalizado, consulte a un nutricionista o proveedor de atención médica. Asegúrese de mantenerse hidratado e incluir una variedad de frutas, verduras, proteínas magras y granos integrales en su dieta.",
            weightPlaceholder: "Ingrese su peso",
            heightPlaceholder: "Ingrese su altura",
            agePlaceholder: "Ingrese su edad",
            errorMissingDataForPlan: "No se puede generar el plan, faltan datos de entrada.",

            // BMI Categories - ES
            bmiSevereThinness: "Delgadez Severa",
            bmiModerateThinness: "Delgadez Moderada",
            bmiMildThinness: "Delgadez Leve",
            bmiNormal: "Normal",
            bmiOverweight: "Sobrepeso",
            bmiObeseClass1: "Obesidad Clase I",
            bmiObeseClass2: "Obesidad Clase II",
            bmiObeseClass3: "Obesidad Clase III",
            childBMIConsult: "(IMC Infantil - consulte a un pediatra)",

            // Health Risks - ES
            healthConsiderations: "Consideraciones de Salud:",
            riskNutritionalDeficiencies: "Posibles deficiencias nutricionales",
            riskWeakenedImmuneSystem: "Sistema inmunológico debilitado",
            riskSevereHealthComplications: "Complicaciones graves de salud",
            riskIncreasedHeartDisease: "Mayor riesgo de enfermedades cardíacas",
            riskHigherType2Diabetes: "Mayor riesgo de diabetes tipo 2",
            riskHighHeartDiseaseStroke: "Alto riesgo de enfermedades cardíacas y accidente cerebrovascular",
            riskHighType2Diabetes: "Alto riesgo de diabetes tipo 2",
            riskIncreasedCertainCancers: "Mayor riesgo de ciertos tipos de cáncer",
            riskEarlyOnsetDiabetes: "Riesgo de diabetes de aparición temprana",
            riskHigherFrailtyFalls: "Mayor riesgo de fragilidad y caídas",
            riskPotentialReproductiveIssues: "Posibles problemas de salud reproductiva",
            bmiDisclaimer: "Nota: Esta es una guía general. Consulte a un profesional de la salud para obtener asesoramiento personalizado.",

            // Nutritional Plan - Macros - ES
            macronutrientDistribution: "Distribución Sugerida de Macronutrientes (gramos aproximados):",
            proteinLabel: "Proteína:",
            carbsLabel: "Carbohidratos:",
            fatsLabel: "Grasas:",
            macroErrorProteinTooHigh: "Error en el cálculo de macros: La ingesta de proteínas es demasiado alta para el objetivo calórico estimado. Revise los datos o consulte a un profesional."
        }
    };

    let currentLanguage = 'en'; // Default language

    function getTranslation(key, params = {}) {
        let text = translations[currentLanguage]?.[key] || translations['en']?.[key] || key; // Fallback to English if key not found in current lang or current lang doesn't exist
        for (const param in params) {
            text = text.replace(`{${param}}`, params[param]);
        }
        return text;
    }

    function updateTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const paramsString = element.getAttribute('data-translate-params');
            let params = {};
            if (paramsString) {
                try {
                    params = JSON.parse(paramsString);
                } catch (e) {
                    console.error("Error parsing translation params: ", e);
                }
            }
            element.innerHTML = getTranslation(key, params);
        });
        // Update placeholders for input fields if necessary
        // Example: document.getElementById('weight').placeholder = getTranslation('weightPlaceholder');
        // This requires adding placeholder keys to the translation object and data-translate attributes to inputs.
        // For now, we'll rely on labels being translated.
         weightInput.placeholder = getTranslation('weightPlaceholder', {defaultValue: "Enter your weight"});
         heightInput.placeholder = getTranslation('heightPlaceholder', {defaultValue: "Enter your height"});
         ageInput.placeholder = getTranslation('agePlaceholder', {defaultValue: "Enter your age"});
    }

    // Make changeLanguage global so it can be called from HTML
    window.changeLanguage = function(lang) {
        if (translations[lang]) {
            currentLanguage = lang;
            document.documentElement.lang = lang; // Update the lang attribute of the HTML element
            updateTranslations();
            // If results are already displayed, re-calculate and re-display them to update translated strings within results
            if (bmiResultDiv.innerHTML !== '') {
                calculateButton.click(); // Simulate click to re-generate results with new language
            }
        } else {
            console.warn(`Language "${lang}" not found.`);
        }
    };

    // Initial translation update on page load
    updateTranslations();
});
