export interface Interview {
    candidatId: string;
    poste: string;
    interviewScore: number | null;
    presenceScore: number;
    feedback: string;
    totalLookAways: number;
    totalLookAwayDuration: number;
    micPausedCount: number;
    status: 'completed' | 'disqualified';
    dateEntretien: string;
    transcript: { role: 'ai' | 'candidat'; text: string; timestamp: number }[];
}

// Vue enrichie utilisée uniquement côté Angular (après le merge avec Candidat)
export interface InterviewRow extends Interview {
    candidateName: string;
    candidateEmail: string;
}