/**
 * Case descriptions for exam case challenges, keyed by "YYYY" year string.
 * Written in Markdown; image paths map to files under /public/cases/.
 */
export const CASE_DESCRIPTIONS: Record<string, string> = {
  "2023": `## Case: Video Recordings of Football Games

A local (Norwegian) football club wants to use video recordings of their matches to analyse their play and stream to people not able to attend the games. The team has bought camera equipment and cloud storage from a UK supplier, and pays a monthly subscription fee for them to manage the video recordings. The club wants to offer these services to teams with players ranging from ages 14-17 (youth teams) and 18+ (adults).

![System architecture overview](/cases/2023-architecture.png)

The season is about to start when somebody informs the club that video can be regarded as personal information, and explicit consent needs to be obtained from anyone appearing in the video recordings. The club contacts you to help them out developing an appropriate consent system. The system should also be used to inform spectators (through a privacy notice):

- That video recording is taking place.
- Which areas will be recorded.
- What the video will be used for.
- Who can see it.
- How it is stored and for how long.
- Who to contact for more information.
- How to object.

During the first meeting with the club you come up with the following business goals for a web-based system:

- **BG1:** Make it easy to give spectators access to the privacy note (e.g., through QR codes).
- **BG2:** Obtain consent from both home and away teams before recording starts (all players).
- **BG3:** Know who has been recorded.
- **BG4:** Keep evidence of the consent.
- **BG5:** Allow consent to be withdrawn.
- **BG6:** If the players are below 15 years of age, parents or guardians need to provide the consent.`,

  "2024": `## Case: Risk Assessment of a Risk Assessment Tool for Air Traffic Management (ATM)

![Case illustration](/cases/2024-illustration.png)

SESAR Joint Undertaking defines, develops and deploys technologies to transform air traffic management (ATM) in Europe. These technologies are known as solutions and are developed in numerous projects under the SESAR JU programme. Solutions can be used to manage conventional aircrafts, drones, air taxis and vehicles flying at higher altitudes, and need to undergo risk assessments at various stages of their development lifecycle (i.e. concept development, lab experiments, prototypes in realistic environments, proven system in operation development).

One of the solutions is a cyber security risk assessment methodology, that is to be applied to the other solutions in order to derive their security requirements and maintain an up-to-date risk picture. A part of this solution is a web-based tool that is intended to make risk assessments easier for other air traffic management solutions. This includes defining scope and goals, identifying assets, threats and vulnerabilities, describing and evaluating risks and deriving security requirements.

Since this web-based tool is considered to be a solution by itself, you will also need to perform a risk assessment of it (effectively a risk assessment of a risk assessment tool).

You have been given the following business goals:

- **BG1:** Support the ATM risk assessment methodology.
- **BG2:** A user-friendly web-interface that supports various stakeholders involved.
- **BG3:** Able to retrieve assets from a digital catalogue of reusable items (e.g. flight data, satellite datalink, primary radar, air traffic controller, passengers).
- **BG4:** Preserve confidentiality of the assessments of the SESAR solutions.
- **BG5:** Allow sharing of risk assessment information between authorized people (involved in an assessment).

![System context diagram](/cases/2024-diagram-2.png)

![Data flow diagram](/cases/2024-diagram-3.png)`,

  "2025": `## Case: D.O.U.C.H.E. Cybersecurity Failure

![Generic service architecture](/cases/2025-illustration.png)  

Government agencies handle sensitive information about citizens and critical operations that require robust security measures. Authentication and access control are fundamental aspects of secure software engineering, ensuring that only authorized personnel can access specific resources and perform certain actions.

A new government administration has established an agency called **D.O.U.C.H.E.** (Department of Uncontrolled Cutting Human Employees) that has been tasked to modernize systems and maximize governmental efficiency across all agencies. D.O.U.C.H.E. operatives have received full access user accounts to the central Azure platform that hosts various public services.

**Key facts:**
- Multifactor authentication (MFA) has been disabled for D.O.U.C.H.E. accounts.
- Remote access is allowed.
- There is no monitoring or logging of their activities.

Last week, one government agency that helps protect working rights of employees noticed that there were web login attempts from a foreign country using valid D.O.U.C.H.E. usernames and passwords. It is suspected that 10 gigabytes of unexplained outbound data related to employees, including union membership, could have been leaked.
![Figure 1: Service architecture](/cases/2025-architecture.png)  
`,
};

export const CASE_TITLES: Record<string, string> = {
  "2023": "Video Recordings of Football Games",
  "2024": "Risk Assessment of a Risk Assessment Tool for ATM",
  "2025": "D.O.U.C.H.E. Cybersecurity Failure",
};

/** Returns the case year from a sourceLabel such as "Exam 2023 Case, Task 4". */
export function caseYearFromSourceLabel(
  sourceLabel: string | undefined,
): string | undefined {
  if (!sourceLabel) return undefined;
  const match = sourceLabel.match(/^Exam (\d{4}) Case,/);
  return match?.[1];
}

/** True when a sourceLabel belongs to a case challenge. */
export function isCaseSourceLabel(sourceLabel: string | undefined): boolean {
  return caseYearFromSourceLabel(sourceLabel) !== undefined;
}
