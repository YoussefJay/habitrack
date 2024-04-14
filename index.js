const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
const randomstring = require("randomstring");

const app = express();

//Server port
const PORT = 3001;

//Supabase credentials
const supabaseUrl = "https://wvodopbhaxbxjbgjrlsn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2b2RvcGJoYXhieGpiZ2pybHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxMTU2MzMsImV4cCI6MjAyODY5MTYzM30.tpLigEc6cAReLy34IUBataBSfyvA70g42EVLm7yQjy0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json());

//CREATE MOCK USER FOR TESTING
function generateMockUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = `${firstName}_${lastName}${randomstring.generate({
    length: 4,
    charset: "numeric",
  })}`;
  const email = faker.internet.email({ firstName, lastName });
  const password = randomstring.generate({
    length: 12,
    charset: "alphanumeric",
  });

  return {
    username,
    email,
    password,
  };
}
app.post("/api/users/mock", async (req, res) => {
  const mockUserData = generateMockUserData();
  const { data, error } = await supabase
    .from("users")
    .insert(mockUserData)
    .select();

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to create mock user!", error });
  }
  return res
    .status(201)
    .json({ message: "Mock user created successfully!", user: data[0] });
});

//END MOCK USER

//Create a habit for a user
app.post("/api/habits/add", async (req, res) => {
  const { habit_name } = req.body;
  const { user_id } = req.headers; // Assuming user ID is sent in headers

  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id, habit_name })
    .select();

  if (error) {
    return res.status(500).json({ message: "Failed to add habit!", error });
  }

  return res
    .status(201)
    .json({ message: "Habit added successfully!", habit: data[0] });
});

//Edit a user's habit by habit id
app.put("/api/habits/edit/:habitId", async (req, res) => {
  const { habitId } = req.params;
  const { habit_name } = req.body;
  const { user_id } = req.headers;

  if (!habit_name) {
    return res.status(500).json({
      message: "Failed to update habit!",
      error: "Habit name is missing",
    });
  }

  // Check if habit belongs to the user
  const { data: habitData, error } = await supabase
    .from("habits")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", user_id)
    .select();

  if (error) {
    return res.status(500).json({ message: "Failed to update habit!", error });
  }

  if (habitData.length === 0) {
    return res
      .status(404)
      .json({ message: "Habit not found or does not belong to you!" });
  }

  // Update habit if it belongs to the user
  const { data, error: updateError } = await supabase
    .from("habits")
    .update({ habit_name })
    .match({ habit_id: habitId })
    .select();

  if (updateError) {
    return res
      .status(500)
      .json({ message: "Failed to update habit!", error: updateError });
  }

  return res
    .status(200)
    .json({ message: "Habit updated successfully!", habit: data[0] });
});

//View user's habits
app.get("/api/habits/view/:userId", async (req, res) => {
  const { userId } = req.params;

  // Check if user exists first
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habits!", error });
  }

  if (userData.length === 0) {
    return res.status(404).json({ message: "User not found!" });
  }

  // If user exists, proceed with retrieving habits
  const { data: habits, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);

  if (habitError) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habits!", error: habitError });
  }

  res.status(200).json({ message: "Habits retrieved successfully!", habits });
});

//Delete a user's habit by habit id
app.delete("/api/habits/delete/:habitId", async (req, res) => {
  const { habitId } = req.params;
  const { user_id } = req.headers;

  try {
    // Check if habit belongs to the user
    const { data: habitData, error } = await supabase
      .from("habits")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", user_id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to delete habit!", error });
    }

    if (habitData.length === 0) {
      return res
        .status(404)
        .json({ message: "Habit not found or does not belong to you!" });
    }

    // Delete habit if it belongs to the user
    const { data, error: deleteError } = await supabase
      .from("habits")
      .delete()
      .match({ habit_id: habitId });

    if (deleteError) {
      return res
        .status(500)
        .json({ message: "Failed to delete habit!", error: deleteError });
    }

    return res.status(200).json({ message: "Habit deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete habit!", error });
  }
});

//Add an entry to a user's journal
app.post("/api/journal/add", async (req, res) => {
  const { entry_content } = req.body;
  const { user_id } = req.headers; // Assuming user ID is sent in headers

  const today = new Date().toISOString(); // Capture current date and time

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ user_id, entry_content, entry_date: today })
    .select();

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to add journal entry!", error });

  return res
    .status(201)
    .json({ message: "Journal entry added successfully!", entry: data[0] });
});

//Get all entries for a user's journal
app.get("/api/journal/entries/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);

  if (userError) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve journal entries!", userError });
  }

  if (userData.length === 0) {
    return res.status(404).json({ message: "User not found!" });
  }

  // Retrieve journal entries for the user
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId);

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to retrieve journal entries!", error });
  return res
    .status(200)
    .json({ message: "Journal entries retrieved successfully!", entries });
});

//Edit an entry in a user's journal
app.put("/api/journal/edit/:entryId", async (req, res) => {
  const { entryId } = req.params;
  const { entry_content } = req.body;

  const { data, error } = await supabase
    .from("journal_entries")
    .update({ entry_content })
    .match({ entry_id: entryId })
    .select();

  if (error)
    return res
      .status(500)
      .json({ message: "Failed to update journal entry!", error });
  if (data.length === 0) {
    return res.status(404).json({ message: "Journal entry not found!" });
  }

  return res
    .status(200)
    .json({ message: "Journal entry updated successfully!", entry: data[0] });
});

//Add a progression to habit by habit id (For ex: If a user has football as a habit, sending a request to this endpoint will mark this habit done for today)
//Data here stored in a seperate table so it can be used to make charts as you asked
app.post("/api/habits/progression/:habitId", async (req, res) => {
  const { habitId } = req.params;
  const progress_date = new Date().toISOString(); // Assuming date is sent in the request body

  // User ID can be retrieved from session/JWT (ensure user owns the habit)
  const { user_id } = req.headers;

  // Check if habit belongs to the user
  const { data: habitData, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", user_id);

  if (habitError) {
    return res
      .status(500)
      .json({ message: "Failed to add habit progression!", error: habitError });
  }

  if (habitData.length === 0) {
    return res
      .status(404)
      .json({ message: "Habit not found or does not belong to you!" });
  }

  // Check if there's existing data for the specific date
  const { data: existingData, error } = await supabase
    .from("habit_progression")
    .select("*")
    .eq("habit_id", habitId)
    .eq("progress_date", progress_date);

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to add habit progression!", error });
  }

  // If existing data exists, update the completion status
  if (existingData.length > 0) {
    const { data, error: updateError } = await supabase
      .from("habit_progression")
      .update({ completion_status: true })
      .match({ habit_id: habitId, progress_date });

    if (updateError) {
      return res.status(500).json({
        message: "Failed to add habit progression!",
        error: updateError,
      });
    }

    return res
      .status(200)
      .json({ message: "Habit completion updated successfully!" });
  }

  // If no existing data, insert a new entry
  const { data, error: insertError } = await supabase
    .from("habit_progression")
    .insert({ habit_id: habitId, progress_date, completion_status: true });

  if (insertError) {
    return res.status(500).json({
      message: "Failed to add habit progression!",
      error: insertError,
    });
  }

  res.status(201).json({ message: "Habit completion added successfully!" });
});

//Get all habits progressions for a user
app.get("/api/habits/progression/:userId", async (req, res) => {
  const { userId } = req.params;

  // 1. Fetch all habits for the user
  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve habit progression!", error });
  }

  if (habits.length === 0) {
    return res.status(200).json({ message: "No habits found for user." });
  }

  // 2. Prepare an empty object to store habit progression data
  const habitProgression = {};

  // 3. Loop through each habit
  for (const habit of habits) {
    const habitId = habit.habit_id;

    // 4. Fetch habit progression data for this habit
    const { data: progressionData, error } = await supabase
      .from("habit_progression")
      .select("*")
      .eq("habit_id", habitId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve habit progression!", error });
    }

    habitProgression[habitId] = progressionData; // Store data for each habit
  }

  return res.status(200).json({
    message: "Habit progression retrieved successfully!",
    progression: habitProgression,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
