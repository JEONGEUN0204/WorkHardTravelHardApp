import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Fontisto, Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    getWorking();
    loadToDos();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@working", JSON.stringify(working));
  }, [working]);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const getWorking = async () => {
    const working = await AsyncStorage.getItem(WORKING_KEY);
    if (working !== null) {
      setWorking(JSON.parse(working));
    }
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = (toSave) => {
    AsyncStorage.setItem("@toDos", JSON.stringify(toSave));
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: {
        text,
        working,
        complete: false,
        edit: false,
        editText: text,
      },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s !== null) {
      setToDos(JSON.parse(s));
    }
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const completeToDo = (key) => {
    const newToDo = { ...toDos };
    newToDo[key].complete = !newToDo[key].complete;
    setToDos(newToDo);
    saveToDos(newToDo);
  };
  const toggleInput = (key) => {
    const newToDo = { ...toDos };
    newToDo[key].edit = !newToDo[key].edit;
    setToDos(newToDo);
  };
  const editToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to edit this To Do?");
      if (ok) {
        const newToDo = { ...toDos };
        newToDo[key].edit = false;
        newToDo[key].text = newToDo[key].editText;
        setToDos(newToDo);
        saveToDos(newToDo);
      } else {
        const newToDo = { ...toDos };
        newToDo[key].editText = newToDo[key].text;
        newToDo[key].edit = false;
        setToDos(newToDo);
        saveToDos(newToDo);
      }
    } else {
      Alert.alert("Edit To Do", "Are you sure?", [
        {
          text: "Cancel",
          onPress: () => {
            const newToDo = { ...toDos };
            newToDo[key].editText = newToDo[key].text;
            newToDo[key].edit = false;
            setToDos(newToDo);
            saveToDos(newToDo);
          },
        },
        {
          text: "I'm Sure",
          onPress: () => {
            const newToDo = { ...toDos };
            newToDo[key].edit = false;
            newToDo[key].text = newToDo[key].editText;
            setToDos(newToDo);
            saveToDos(newToDo);
          },
        },
      ]);
    }
  };
  const onChangeEditText = (text, key) => {
    const newToDo = { ...toDos };
    newToDo[key].editText = text;
    setToDos(newToDo);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: "white",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: "white",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyDone="done"
          value={text}
          style={styles.input}
          placeholder={working ? "Add a To Do" : "Where do you want to go"}
        />
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                {toDos[key].edit ? (
                  <TextInput
                    style={styles.editInput}
                    onSubmitEditing={() => editToDo(key)}
                    returnKeyDone="done"
                    value={toDos[key].editText}
                    onChangeText={(text) => onChangeEditText(text, key)}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].complete
                        ? "line-through"
                        : null,
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
                <View style={styles.icons}>
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={() => completeToDo(key)}
                  >
                    <Fontisto
                      name={
                        toDos[key].complete
                          ? "checkbox-active"
                          : "checkbox-passive"
                      }
                      size={20}
                      color={theme.grey}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={() => toggleInput(key)}
                  >
                    <Feather name="edit" size={20} color={theme.grey} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={() => deleteToDo(key)}
                  >
                    <Fontisto name="trash" size={20} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },

  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    paddingVertical: 10,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    paddingLeft: 12,
  },
  editInput: {
    marginVertical: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    fontSize: 18,
    opacity: 0.5,
    color: "white",
  },
});
