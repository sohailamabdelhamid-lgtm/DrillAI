import { NextRequest, NextResponse } from 'next/server';

// Modal 4o-mini API configuration (free model)
const MODAL_API_URL = 'https://api.modal.com/v1/chat/completions';
const MODAL_API_KEY = process.env.MODAL_API_KEY || 'your-modal-api-key-here';

// Define proper types for drilling data
interface DrillingDataPoint {
  Depth?: number;
  depth?: number;
  DEPTH?: number;
  DT?: number;
  dt?: number;
  GR?: number;
  gr?: number;
  SH?: number;
  sh?: number;
  SS?: number;
  ss?: number;
  LS?: number;
  ls?: number;
  DOL?: number;
  dol?: number;
  ANH?: number;
  anh?: number;
  Coal?: number;
  coal?: number;
  Salt?: number;
  salt?: number;
  [key: string]: number | string | undefined;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

// Fallback chatbot responses when Modal is not available
function generateFallbackResponse(message: string, wellName: string, wellData: DrillingDataPoint[] | null, attachments?: FileAttachment[]): string {
  const lowerMessage = message.toLowerCase();
  
  // Handle XLSX file attachments
  if (attachments && attachments.length > 0) {
    const xlsxFiles = attachments.filter(file => file.name.endsWith('.xlsx'));
    
    if (xlsxFiles.length > 0) {
      const fileList = xlsxFiles.map(file => `- ${file.name} (${(file.size / 1024).toFixed(1)}KB)`).join('\n');
      
      // Try to parse the XLSX data if available
      let dataAnalysis = '';
      if (xlsxFiles[0].content) {
        try {
          const parsedData = JSON.parse(xlsxFiles[0].content);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            const sampleRow = parsedData[0];
            const columns = Object.keys(sampleRow);
            dataAnalysis = `

### 📊 Data Analysis

I've successfully parsed your XLSX file and found:
- **Total rows**: ${parsedData.length}
- **Columns**: ${columns.join(', ')}
- **Sample data**: ${JSON.stringify(sampleRow, null, 2)}

The data has been loaded into your drilling charts! You can now see the visual representation of your drilling data in the "Drilling Monitoring" tab.`;
          }
        } catch {
          dataAnalysis = '\n\n### ⚠️ Data Parsing\n\nI received the file but had trouble parsing the data. The file may be uploaded to the charts anyway.';
        }
      }
      
      return `## 📎 XLSX File Uploaded Successfully!

I've received your Excel file for ${wellName}:

${fileList}${dataAnalysis}

### 🎯 What's Next?

Your drilling data is now available in the charts! You can:

- **View the data**: Check the "Drilling Monitoring" tab to see your data visualized
- **Ask questions**: Ask me about specific aspects of your drilling data
- **Get insights**: Request analysis of rock composition, DT values, GR readings, etc.

### 💡 Example Questions

- "What's the average DT value in my data?"
- "Show me the rock composition analysis"
- "What are the depth ranges in this well?"
- "Analyze the GR trends"

What would you like to know about your drilling data?`;
    }
  }

  // Analyze the message and provide contextual responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello! I'm Drill AI, your drilling data assistant for ${wellName}. I can help you analyze drilling data, interpret rock compositions, and provide insights about your drilling operations.`;
  }

  if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you') || lowerMessage.includes('thx')) {
    return `You're welcome! I'm here to help with all your drilling data analysis needs. Feel free to ask me anything about your drilling operations, data interpretation, or if you need assistance with anything else.`;
  }

  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return `Goodbye! It was great helping you with your drilling data analysis. Feel free to come back anytime you need assistance with your drilling operations. Have a great day!`;
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `## 🤖 How I Can Help You

I'm Drill AI, your specialized assistant for drilling operations. Here's what I can do:

### 📊 Data Analysis
- Analyze drilling data from XLSX files
- Interpret rock composition percentages
- Explain DT (Delta T) and GR (Gamma Ray) values
- Provide drilling recommendations

### 🎯 Specific Capabilities
- **File Upload**: Upload XLSX files to analyze drilling data
- **Chart Integration**: Data automatically displays in your drilling charts
- **Real-time Analysis**: Get instant insights about your well data
- **Expert Knowledge**: Access to drilling industry best practices

### 💡 Example Questions
- "What does this DT value mean?"
- "Analyze the rock composition in my data"
- "What are the drilling recommendations for this formation?"
- "Explain the GR trends in my well"

Just upload your XLSX file or ask me anything about drilling data!`;
  }

  if (lowerMessage.includes('ok') || lowerMessage.includes('okay') || lowerMessage.includes('alright')) {
    return `Great! I'm ready to help. You can upload an XLSX file with your drilling data or ask me any questions about drilling operations, data analysis, or well interpretation.`;
  }

  if (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('yep')) {
    return `Perfect! What would you like to know about your drilling data or operations?`;
  }

  if (lowerMessage.includes('no') || lowerMessage.includes('nope')) {
    return `No problem! Let me know if you need any help with drilling data analysis or have any questions about your operations.`;
  }
  
  if (lowerMessage.includes('chart') || lowerMessage.includes('data') || lowerMessage.includes('analysis') || lowerMessage.includes('saying')) {
    if (wellData && wellData.length > 0) {
      const depths = wellData.map(d => d.Depth || d.depth || d.DEPTH).filter((d): d is number => d !== undefined && !isNaN(d));
      const maxDepth = depths.length > 0 ? Math.max(...depths) : 'unknown';
      const minDepth = depths.length > 0 ? Math.min(...depths) : 'unknown';
      
      // Analyze the data trends
      const dtValues = wellData.map(d => d.DT || d.dt).filter((d): d is number => d !== undefined && !isNaN(d));
      const grValues = wellData.map(d => d.GR || d.gr).filter((d): d is number => d !== undefined && !isNaN(d));
      const avgDT = dtValues.length > 0 ? parseFloat((dtValues.reduce((a, b) => a + b, 0) / dtValues.length).toFixed(1)) : 0;
      const avgGR = grValues.length > 0 ? parseFloat((grValues.reduce((a, b) => a + b, 0) / grValues.length).toFixed(1)) : 0;
      
      return `## 📊 Drilling Data Analysis for ${wellName}

I can see you have **${wellData.length} data points** with depth ranging from **${minDepth}** to **${maxDepth} feet**.

### 🔍 Key Insights

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| **Average DT** | ${avgDT} | ${avgDT > 60 ? 'Moderate to high porosity formations' : 'Dense, low porosity formations'} |
| **Average GR** | ${avgGR} | ${avgGR > 75 ? 'Shale-rich formations' : 'Clean sandstone/limestone formations'} |

### 📈 Charts Analysis

#### 🪨 Rock Composition Chart
- **SH (Shale)**: Clay-rich sedimentary rock
- **SS (Sandstone)**: Quartz-rich sedimentary rock  
- **LS (Limestone)**: Calcium carbonate rock
- **DOL (Dolomite)**: Magnesium carbonate rock
- **ANH (Anhydrite)**: Calcium sulfate mineral
- **Coal**: Organic sedimentary rock
- **Salt**: Halite mineral deposits

#### 📏 DT (Delta T) Chart
- Displays **acoustic travel time** variations with depth
- Indicates **porosity and rock density** changes
- Higher values = more porous formations
- Lower values = denser formations

#### ☢️ GR (Gamma Ray) Chart  
- Shows **natural radioactivity** levels
- Essential for **lithology identification**
- High values = shale formations
- Low values = clean sandstone/limestone

### 💡 Recommendations

Based on your data:
- **Formation Type**: ${avgDT > 60 && avgGR > 75 ? 'Mixed shale-sandstone with good porosity' : avgDT > 60 ? 'High porosity sandstone formation' : avgGR > 75 ? 'Dense shale formation' : 'Low porosity carbonate formation'}
- **Drilling Considerations**: Monitor for ${avgGR > 75 ? 'shale swelling and borehole stability' : 'formation changes and potential reservoir zones'}

Would you like me to explain any specific aspect in more detail?`;
    } else {
      return `I'd be happy to help analyze your drilling data for ${wellName}! However, I don't see any data uploaded yet. Please upload your drilling data file first, and then I can provide detailed analysis of the rock composition, DT values, and GR readings.`;
    }
  }
  
  if (lowerMessage.includes('rock') || lowerMessage.includes('composition')) {
    return `## 🪨 Rock Composition Analysis

Rock composition analysis shows the **percentage of different rock types** at various depths in your well.

### 📊 Common Rock Types

| Rock Type | Code | Description | Typical % |
|-----------|------|-------------|-----------|
| **Shale** | SH | Clay-rich sedimentary rock | 30-50% |
| **Sandstone** | SS | Quartz-rich sedimentary rock | 20-40% |
| **Limestone** | LS | Calcium carbonate rock | 10-30% |
| **Dolomite** | DOL | Magnesium carbonate rock | 5-15% |
| **Anhydrite** | ANH | Calcium sulfate mineral | 2-10% |
| **Coal** | Coal | Organic sedimentary rock | 0-5% |
| **Salt** | Salt | Halite mineral deposits | 0-3% |

### 🔍 Interpretation Guidelines

- **SH + SS > 70%**: Clastic sedimentary environment
- **LS + DOL > 30%**: Carbonate platform environment  
- **ANH present**: Evaporite sequence
- **Coal present**: Swamp/marsh environment
- **Salt present**: Evaporite basin conditions

### 💡 Drilling Implications

- **High SH%**: Monitor for borehole instability
- **High SS%**: Good reservoir potential
- **High LS/DOL%**: Potential for acid stimulation
- **ANH present**: Risk of salt creep
- **Coal present**: Gas hazard potential`;
  }
  
  if (lowerMessage.includes('dt') || lowerMessage.includes('delta')) {
    return `## 📏 DT (Delta T) Analysis

**Delta T** measures **acoustic travel time** and is crucial for understanding rock properties.

### 🔍 What DT Tells Us

| DT Range | Interpretation | Rock Type | Porosity |
|----------|----------------|-----------|----------|
| **< 50 μs/ft** | Very dense, low porosity | Dense limestone, dolomite | < 5% |
| **50-60 μs/ft** | Dense, low porosity | Shale, tight sandstone | 5-10% |
| **60-80 μs/ft** | Moderate porosity | Sandstone, limestone | 10-20% |
| **80-100 μs/ft** | Good porosity | Porous sandstone | 20-30% |
| **> 100 μs/ft** | High porosity | Highly porous sandstone | > 30% |

### 💡 Key Applications

- **Reservoir Identification**: High DT = potential reservoir zones
- **Porosity Estimation**: DT correlates with rock porosity
- **Lithology Identification**: Different rocks have characteristic DT ranges
- **Fracture Detection**: Sudden DT increases may indicate fractures
- **Fluid Identification**: Gas zones show higher DT values

### ⚠️ Important Notes

- **Gas Effect**: Gas presence increases DT values
- **Pressure Effect**: Overpressure reduces DT values  
- **Temperature Effect**: Higher temperatures increase DT values
- **Mud Weight**: Heavy mud reduces DT values`;
  }
  
  if (lowerMessage.includes('gr') || lowerMessage.includes('gamma')) {
    return `## ☢️ GR (Gamma Ray) Analysis

**Gamma Ray** measures **natural radioactivity** and is essential for lithology identification.

### 🔍 What GR Tells Us

| GR Range | Interpretation | Rock Type | Radioactivity Source |
|----------|----------------|-----------|---------------------|
| **< 30 API** | Very low radioactivity | Clean sandstone, limestone | Minimal |
| **30-60 API** | Low radioactivity | Sandstone, limestone | Trace elements |
| **60-90 API** | Moderate radioactivity | Shaly sandstone, marl | Clay minerals |
| **90-120 API** | High radioactivity | Shale, claystone | Potassium, thorium |
| **> 120 API** | Very high radioactivity | Organic-rich shale | Uranium, thorium |

### 📊 Lithology Identification

- **Low GR (< 60 API)**: Clean reservoir rocks
- **High GR (> 90 API)**: Shale, clay-rich rocks
- **Variable GR**: Mixed lithology, formation boundaries
- **Spiky GR**: Fractured zones, washouts

### 💡 Key Applications

- **Formation Correlation**: Match formations between wells
- **Reservoir Quality**: Low GR = good reservoir potential
- **Shale Volume**: Calculate clay content
- **Sequence Stratigraphy**: Identify depositional environments
- **Well-to-Well Correlation**: Essential for field mapping

### ⚠️ Important Notes

- **Organic Content**: High organic content increases GR
- **Uranium**: Can cause false high GR readings
- **Borehole Conditions**: Washouts affect GR readings
- **Mud Weight**: Heavy mud can reduce GR response`;
  }
  
  if (lowerMessage.includes('recommendation') || lowerMessage.includes('advice')) {
    return `## 💡 Drilling Recommendations

Based on your drilling data analysis, here are key recommendations:

### 🎯 General Guidelines

| Parameter | Monitor For | Action Required |
|-----------|-------------|-----------------|
| **ROP Changes** | Formation changes, bit wear | Adjust drilling parameters |
| **DT Spikes** | Fractures, gas zones | Reduce mud weight, monitor gas |
| **GR Variations** | Lithology changes | Adjust drilling strategy |
| **Rock Composition** | Formation boundaries | Prepare for formation changes |

### ⚠️ Safety Considerations

- **High GR Zones**: Monitor for shale swelling
- **Low DT Zones**: Watch for hard formations
- **Coal Presence**: Monitor for gas hazards
- **Salt Formations**: Risk of salt creep

### 🔧 Optimization Tips

- **High Porosity Zones**: Reduce mud weight to prevent formation damage
- **Shale Intervals**: Use inhibitive mud systems
- **Carbonate Formations**: Consider acid stimulation potential
- **Fractured Zones**: Monitor for lost circulation

### 📊 Data Monitoring

- **Real-time ROP**: Track drilling efficiency
- **Mud Properties**: Monitor density, viscosity
- **Gas Detection**: Continuous monitoring
- **Formation Pressure**: Maintain overbalance

Would you like specific recommendations based on your actual data?`;
  }
  
  // Default response - more conversational
  return `I understand you're asking about "${message}". I'm Drill AI, your drilling data assistant for ${wellName}. 

I can help you with:
- 📊 Analyzing drilling data from XLSX files
- 🪨 Interpreting rock compositions and formations  
- 📏 Explaining DT and GR values
- 💡 Providing drilling recommendations
- 📈 Chart analysis and insights

You can upload an XLSX file or ask me specific questions about drilling operations. What would you like to explore?`;
}

// Modal API configuration
// const modalConfig = {
//   apiUrl: MODAL_API_URL,
//   apiKey: MODAL_API_KEY,
//   model: 'gpt-4o-mini'
// };

export async function POST(request: NextRequest) {
  let wellName = 'Unknown Well';
  let wellData: DrillingDataPoint[] | null = null;
  let message = '';
  let attachments: FileAttachment[] | null = null;
  
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ 
        response: 'Invalid request format. Please try again.' 
      }, { status: 400 });
    }
    
    const { message: reqMessage, wellName: reqWellName, wellData: reqWellData, attachments: reqAttachments } = requestData;
    
    message = reqMessage || '';
    wellName = reqWellName || 'Unknown Well';
    wellData = reqWellData;
    attachments = reqAttachments;

    console.log('Chat API called with:', { message, wellName, wellDataLength: wellData?.length, attachmentsCount: attachments?.length });

    if (!message && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'No message or attachments provided' }, { status: 400 });
    }

    // Check if Modal API key is configured
    console.log('Modal API Key check:', {
      hasKey: !!MODAL_API_KEY,
      keyLength: MODAL_API_KEY?.length,
      keyPrefix: MODAL_API_KEY?.substring(0, 10)
    });
    
    // Use fallback chatbot by default (Modal API has issues)
    console.log('Using fallback chatbot (Modal API temporarily disabled)');
    const fallbackResponse = generateFallbackResponse(message, wellName, wellData, attachments || undefined);
    return NextResponse.json({ response: fallbackResponse });
  } catch (error) {
    console.error('Chat error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      wellName: wellName || 'Unknown Well',
      hasWellData: !!wellData
    });
    
    // Provide more specific error messages
    let fallbackResponse = `I'm Drill AI, your drilling data assistant for ${wellName || 'this well'}. `;
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        fallbackResponse += 'There seems to be an issue with the API configuration. Please check the Modal API key setup.';
      } else if (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('quota') || error.message.includes('insufficient_quota')) {
        // Use fallback chatbot when quota is exceeded
        console.log('Modal API quota exceeded, using fallback chatbot');
        const fallbackChatResponse = generateFallbackResponse(message, wellName, wellData, attachments || undefined);
        return NextResponse.json({ response: fallbackChatResponse });
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        fallbackResponse += 'Network connection issue. Please check your internet connection.';
      } else {
        // For any other error, use fallback chatbot
        console.log('Modal API error, using fallback chatbot:', error.message);
        const fallbackChatResponse = generateFallbackResponse(message, wellName, wellData, attachments || undefined);
        return NextResponse.json({ response: fallbackChatResponse });
      }
    } else {
      fallbackResponse += 'I\'m experiencing technical difficulties. Please try again later.';
    }
    
    return NextResponse.json({ response: fallbackResponse });
  }
}
