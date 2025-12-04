const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from a file (PDF or DOCX)
 */
async function extractText(filePath, mimeType) {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        if (mimeType === 'application/pdf') {
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
}

/**
 * Parse CV text to extract structured data
 */
function parseCVText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 1. Extract Name (Heuristic: First non-empty line that isn't a common header)
    let name = "";
    const commonHeaders = ['curriculum vitae', 'resume', 'cv', 'personal details', 'profile', 'summary'];
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (!commonHeaders.includes(line.toLowerCase()) && line.split(' ').length < 5) {
            name = line;
            break;
        }
    }

    // 2. Extract Email
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : "";

    // 3. Extract Mobile (Egyptian numbers)
    const mobileRegex = /(010|011|012|015)[0-9]{8}/;
    const mobileMatch = text.match(mobileRegex);
    const mobile = mobileMatch ? mobileMatch[0] : "";

    // 4. Extract Skills (Simple keyword matching against a predefined list)
    const commonSkills = [
        "javascript", "react", "node.js", "python", "java", "c++", "c#", "php", "sql", "mysql", "mongodb",
        "html", "css", "git", "docker", "aws", "azure", "angular", "vue", "typescript", "express",
        "django", "flask", "spring", "laravel", "dotnet", "machine learning", "data analysis", "project management",
        "communication", "leadership", "problem solving", "english", "arabic", "french", "german"
    ];
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    commonSkills.forEach(skill => {
        if (lowerText.includes(skill)) {
            foundSkills.push(skill); // Keep lowercase for consistency, or capitalize if needed
        }
    });

    // 5. Extract Experience (Heuristic: Look for "years" or date ranges)
    // This is hard to do accurately with regex alone, but we can try to find "X years"
    const experienceRegex = /(\d+)\+?\s*(years?|yrs?)/i;
    const expMatch = text.match(experienceRegex);
    let experience = "";
    if (expMatch) {
        experience = expMatch[1];
    }

    // 6. Extract Education (Heuristic: Look for degree keywords)
    const educationKeywords = ["bachelor", "master", "phd", "bsc", "msc", "degree", "university", "college", "faculty"];
    let education = "";
    for (const line of lines) {
        if (educationKeywords.some(kw => line.toLowerCase().includes(kw))) {
            education = line;
            break; // Take the first match
        }
    }

    return {
        name,
        email,
        mobile,
        skills: foundSkills, // Return array
        experience,
        education
    };
}

module.exports = {
    extractText,
    parseCVText
};
