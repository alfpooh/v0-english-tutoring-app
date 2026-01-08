// This script can be used to verify the API key and create the agent manually if needed.
// The same logic is implemented in the API route for automatic provisioning.

const API_KEY = "sk_dbeab933805d8b9b9db19901478b66a02c5f8e67b0e06dd6";
const BASE_URL = "https://api.elevenlabs.io/v1/convai";
const AGENT_NAME = "English Tutor (v0)";

async function setupAgent() {
  try {
    console.log("Checking for existing agent...");
    const listRes = await fetch(`${BASE_URL}/agents`, {
      headers: { 'xi-api-key': API_KEY }
    });
    
    if (!listRes.ok) throw new Error(`Failed to list agents: ${listRes.statusText}`);
    
    const data = await listRes.json();
    const existing = data.agents.find(a => a.name === AGENT_NAME);
    
    const agentConfig = {
      name: AGENT_NAME,
      conversation_config: {
        agent: {
          prompt: {
            prompt: `You are a helpful and patient English tutor. Your goal is to help the user improve their English skills. You correct their grammar politely, suggest better vocabulary, and engage them in interesting conversation.

VOCABULARY TEACHING:
When you introduce or use an important or advanced English word during the conversation, you MUST call the \`showVocabulary\` client tool to display the word definition to the user. This helps them learn new vocabulary visually.

The \`showVocabulary\` tool takes these arguments:
1. \`word\`: The English word (e.g., "picturesque")
2. \`pronunciation\`: IPA pronunciation (e.g., "/ˌpɪk.tʃəˈresk/")
3. \`partOfSpeech\`: The part of speech in Korean (e.g., "형용사", "명사", "동사", "부사")
4. \`definition\`: The definition in Korean
5. \`example\`: An example sentence using the word in English

Call this tool whenever you:
- Introduce a new vocabulary word
- Correct the user's word choice with a better alternative
- Use an advanced word that might be unfamiliar

SESSION END:
When the user says 'goodbye', 'bye', 'I am done', or indicates they want to end the session, you MUST call the \`reportEvaluation\` client tool. Do not just say goodbye.

The \`reportEvaluation\` tool takes three arguments:
1. \`proficiency\`: A short assessment of their level (e.g., Beginner, Intermediate).
2. \`summary\`: A brief summary of what we talked about.
3. \`advice\`: Specific advice on how they can improve based on this session.

IMPORTANT: The content of \`proficiency\`, \`summary\`, and \`advice\` MUST BE IN KOREAN (Hangul). Speak in English during the lesson, but provide the final report in Korean.`
          },
          first_message: "Hello! I am your English tutor. Ready to practice?",
          language: "en"
        },
        tts: {
          voice_id: "21m00Tcm4TlvDq8ikWAM"
        }
      }
    };

    if (existing) {
      console.log(`Found existing agent: ${existing.agent_id}. Updating configuration...`);
      const updateRes = await fetch(`${BASE_URL}/agents/${existing.agent_id}`, {
        method: 'PATCH',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_config: agentConfig.conversation_config
        })
      });

      if (!updateRes.ok) {
        const err = await updateRes.text();
        console.error(`Failed to update agent: ${err}`);
        return existing.agent_id;
      }
      
      console.log("Successfully updated agent configuration.");
      return existing.agent_id;
    }
    
    console.log("Creating new agent...");
    const createRes = await fetch(`${BASE_URL}/agents/create`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentConfig)
    });
    
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create agent: ${err}`);
    }
    
    const agent = await createRes.json();
    console.log(`Successfully created agent! ID: ${agent.agent_id}`);
    return agent.agent_id;
    
  } catch (err) {
    console.error("Setup failed:", err);
  }
}

setupAgent();
