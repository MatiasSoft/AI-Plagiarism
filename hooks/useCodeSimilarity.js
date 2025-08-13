import {useCallback} from 'react';


// Función para tokenizar el texto y devolver una lista de palabras.
const tokenize = (code) => {
   return code.toLowerCase().match(/\b\w+\b/g) || [];
}

export const useCodeSimilarity = () => {
    
    //---------------------------------------------------------
    // 1. Algoritmo de Frecuencia de Término (TF) y Coseno
    //---------------------------------------------------------
    const calculateSimilarityTF = (codeA, codeB) => {
        const tokensA = tokenize(codeA);
        const tokensB = tokenize(codeB);

        if (tokensA.length === 0 || tokensB.length === 0) {
            return 0;
        }

        const allTokens = [...tokensA, ...tokensB];
        const vocabulary = new Set(allTokens);

        const tfA = new Map()
        for (const token of tokensA){
            const currentCount = tfA.get(token) || 0;
            tfA.set(token, currentCount + 1)
        }
        tfA.forEach((count, token) => {
            tfA.set(token, count/tokensA.length);
        });

        const tfB = new Map()
        for (const token of tokensB){
            const currentCount = tfB.get(token) || 0;
            tfB.set(token, currentCount + 1)
        }
        tfB.forEach((count, token) => {
            tfB.set(token, count/tokensB.length);
        });

        const vectorA = []
        const vectorB = []

        vocabulary.forEach(token => {
            const tfAValue = tfA.get(token) || 0;
            const tfBValue = tfB.get(token) || 0;
            vectorA.push(tfAValue);
            vectorB.push(tfBValue);
        });
    
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    };

    //---------------------------------------------------------
    // 2. Similitud de Jaccard
    //---------------------------------------------------------
    const calculateJaccard = (codeA, codeB) => {
        const tokensA = tokenize(codeA);
        const tokensB = tokenize(codeB);

        if (tokensA.length === 0 || tokensB.length === 0) {
            return 0;
        }

        const setA = new Set(tokensA);
        const setB = new Set(tokensB);

        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);

        if (union.size === 0) {
            return 0;
        }

        return intersection.size / union.size;
    };
    
    //---------------------------------------------------------
    // 3. Distancia de Levenshtein
    //---------------------------------------------------------
    const calculateLevenshtein = (codeA, codeB) => {
        codeA = codeA.trim();
        codeB = codeB.trim();

        const m = codeA.length;
        const n = codeB.length;

        if (m === 0) return n === 0 ? 1 : 0;
        if (n === 0) return 0;

        
        if (n < m) [codeA, codeB] = [codeB, codeA];

        let previousRow = Array(codeB.length + 1).fill(0);
        let currentRow = Array(codeB.length + 1).fill(0);

        for (let j = 0; j <= codeB.length; j++) {
            previousRow[j] = j;
        }

        for (let i = 1; i <= codeA.length; i++) {
            currentRow[0] = i;
            for (let j = 1; j <= codeB.length; j++) {
                const cost = codeA[i - 1] === codeB[j - 1] ? 0 : 1;
                currentRow[j] = Math.min(
                    previousRow[j] + 1,      // Eliminación
                    currentRow[j - 1] + 1,   // Inserción
                    previousRow[j - 1] + cost // Sustitución
                );
            }
            [previousRow, currentRow] = [currentRow, previousRow];
        }

        const distance = previousRow[codeB.length];
        const maxLength = Math.max(m, n);
        return 1 - distance / maxLength; // Similitud entre 0 y 1
    };

    // Retorna las funciones para que puedan ser usadas
    return { calculateSimilarityTF, calculateJaccard, calculateLevenshtein };
};