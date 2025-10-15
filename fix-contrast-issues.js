const fs = require('fs');'
const path = require('path');

// Función para buscar archivos recursivamente
function findFiles(dir, extension) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath, extension));
        } else if (file.endsWith(extension)) {
            results.push(filePath);
        }
    });
    
    return results;
}

// Patrones problemáticos de contraste
const contrastIssues = [
    {
        pattern: /text-gray-800(?![^<]*dark:)/g,'
        replacement: 'text-light-text dark:text-dark-text','
        description: 'text-gray-800 sin dark mode',
    },
    {
        pattern: /text-gray-900(?![^<]*dark:)/g,'
        replacement: 'text-light-text dark:text-dark-text','
        description: 'text-gray-900 sin dark mode',
    },
    {
        pattern: /text-black(?![^<]*dark:)/g,'
        replacement: 'text-light-text dark:text-dark-text','
        description: 'text-black sin dark mode',
    },
];

// Buscar todos los archivos .tsx en components'
const componentFiles = findFiles('./components', '.tsx');

let totalFixed = 0;

componentFiles.forEach(filePath => {
    try {'
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        let fileFixed = 0;
        
        contrastIssues.forEach(issue => {
            const matches = content.match(issue.pattern);
            if (matches) {
                content = content.replace(issue.pattern, issue.replacement);
                hasChanges = true;
                fileFixed += matches.length;
                }: ${issue.description} (${matches.length} ocurrencias)");
            }
        });
        
        if (hasChanges) {'
            fs.writeFileSync(filePath, content, 'utf8');
            totalFixed += fileFixed;"
            }: fileFixed problemas corregidos");
        }
    } catch (error) {"
        console.error("❌ Error procesando filePath:", error.message);
    }
});

'"