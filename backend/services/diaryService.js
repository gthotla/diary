import  Diary from '../models/diary.js';

//FUcntion to create a  diary entry
 export const createDiaryEntry=async(data)=>{
   try {
        const { title, entry, mood, images, videos, links, user } = data;
        const newDiaryEntry = new Diary({
             title,
             entry,
             mood,
             images,
             videos,
             links,
             user
        });
        await newDiaryEntry.save();
        return newDiaryEntry;
    
   } catch (err) {
      console.error("Error ceating diary entry :",err.message);
        throw new Error("Error creating diary entry: " + err.message);
   }
 }

 //function to get all diary entries of a user

 export const getAllDiaryEntries=async(userId)=>{
     try {
        const diaryEntries=await Diary.find({user:userId},{sort:-1});
        return diaryEntries;
        
     } catch (err) {
        console.error("Error fetching diary entries:", err.message);
        throw new Error("Error fetching diary entries: " + err.message);
        
     } 
}

//function to get diary netry by id ;
export const getDiaryEntryById = async (id, userId) => {
    const entry = await Diary.findOne({ _id: id, user: userId });
    return entry;
  };

//function to update diary entry by id
export  const updateEntry=async(id,userId,updatedData)=>{
    try{
     const updatedEntry=await Diary.findByIdAndUpdate({_id:id,user:userId},{updatedData},{new:true, runValidators:true});
     return updateEntry;
    }
    catch(err){
        console.error("Error updating the Entry: ",err.message);
        throw new Error("Error updating diary Entry: "+ err.message);
    }
}

//function to delete the Entry
export const deleteEntry = async(id,userID)=>{
    try{
        const deletedEntry = await Diary.findByIdAndDelete({_id:id,user:userID})
    }
    catch(err){
        console.error("Error Deleting diary entry: ",err.message);
        throw new Error("Error Deleting Diary Entry: "+err.message);
    }
}

//function to get the Diary entries in specific range 
export const getDiaryInRange = async(userId, startDate, endDate) => {
   try {
        const diaryEntries=await Diary.find({
            user: userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        },{sort:-1});
        return diaryEntries;
   } catch (err) {
    console.error("Error fetching diary entries in range:", err.message);
    throw new Error("Error fetching diary entries in range: " + err.message);
   }
}

//function to get the Diary by time (year, month, day)
export const getEntriesByTime = async (userId, type, value) => {
    const matchStage = { user: userId };
  
    const projectStage = {
      year: { $year: '$date' },
      month: { $month: '$date' },
      day: { $dayOfMonth: '$date' },
      title: 1,
      entry: 1,
      mood: 1,
      date: 1,
    };
  
    if (type === 'year') matchStage['$expr'] = { $eq: [{ $year: '$date' }, parseInt(value)] };
    if (type === 'month') matchStage['$expr'] = { $eq: [{ $month: '$date' }, parseInt(value)] };
    if (type === 'day') matchStage['$expr'] = { $eq: [{ $dayOfMonth: '$date' }, parseInt(value)] };
  
    return await Diary.aggregate([
      { $match: matchStage },
      { $project: projectStage },
      { $sort: { date: -1 } }
    ]);
  };