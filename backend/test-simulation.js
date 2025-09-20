// test-simulation.js
require('dotenv').config();
const { conductSimulatedInterviewSmart } = require('./src/agents/productExpertAgent');

async function testSimulation() {
  console.log('🧪 Testing ProductExpert Agent Simulation\n');
  
  const testPersona = "Tech startup CEO, focused on AI productivity tools, values efficiency and innovation, frustrated with bloated software.";
  const testProduct = "A minimalist AI writing assistant that helps busy professionals write faster and better.";

  try {
    const result = await conductSimulatedInterviewSmart(testPersona, testProduct);
    console.log('✅ Simulation successful!');
    console.log('Generated questions:', result.simulationReport.originalQuestions);
    console.log('Strategic advice:', result.simulationReport.strategicAdvice);
    console.log('\nFull simulation report saved to simulation-test.json');
    
    require('fs').writeFileSync('simulation-test.json', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Simulation failed:', error.message);
  }
}

testSimulation();
