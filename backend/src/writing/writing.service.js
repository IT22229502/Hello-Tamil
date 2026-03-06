const { spawn } = require("child_process");

const feedbackEngine =
  require("./spatial.feedback");


exports.evaluateWriting = async (imageData)=>{

  return new Promise((resolve,reject)=>{

    const python = spawn("python",[
      "python/spatial_analysis.py",
      imageData
    ]);

    let data="";

    python.stdout.on("data",(chunk)=>{
      data += chunk.toString();
    });

    python.stderr.on("data",(err)=>{
      console.error(err.toString());
    });

    python.on("close",()=>{

      try{

        const result = JSON.parse(data);

        const feedback =
          feedbackEngine.generateFeedback(
            result.spacingScore,
            result.baselineScore,
            result.letterConsistencyScore
          );

        const practice =
          feedbackEngine.practiceSuggestions(
            result.spacingScore,
            result.baselineScore,
            result.letterConsistencyScore
          );

        resolve({

          ...result,

          feedback,
          recommendedExercises: practice

        });

      }
      catch(error){

        reject("Python analysis failed");

      }

    });

  });

};