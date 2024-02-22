import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Button,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export default function Completed() {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  useEffect(() => {
    // Load tasks from AsyncStorage when the component mounts
    loadTasks();
  }, []);

  useEffect(() => {
    // Save tasks to AsyncStorage whenever it changes
    saveTasks();
  }, [tasks]);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      if (jsonValue !== null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load tasks from AsyncStorage:', e);
    }
  };

  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error('Failed to save tasks to AsyncStorage:', e);
    }
  };

  const addTask = () => {
    const newTask = { id: Date.now().toString(), title: taskTitle, description: taskDescription, completed: false, createdAt: new Date() };
    setTasks([...tasks, newTask]);
    setIsModalVisible(false);
    setTaskTitle('');
    setTaskDescription('');
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };
  
  const renderTask = ({ item }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskCreatedAt}>{getCreatedAtText(item.createdAt)}</Text>
      </View>
      <View style={styles.taskButtons}>
        <TouchableOpacity style={styles.taskButton} onPress={() => deleteTask(item.id)}>
          <FontAwesome name="trash" size={20} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.taskButton} onPress={() => toggleComplete(item.id)}>
          {item.completed ? (
            <MaterialIcons name="undo" size={20} color="orange" />
          ) : (
            <AntDesign name="checkcircle" size={20} color="green" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCreatedAtText = (createdAt) => {
    const now = moment();
    const createdMoment = moment(createdAt);
    const duration = moment.duration(now.diff(createdMoment));
    let timeText;

    if (duration.asMinutes() < 60) {
      timeText = `${duration.asMinutes().toFixed(0)}m ago`;
    } else if (duration.asHours() < 24) {
      timeText = `${duration.asHours().toFixed(0)}h ago`;
    } else {
      timeText = `${duration.asDays().toFixed(0)}d ago`;
    }

    return timeText;
  };


  return (
    <View style={styles.container}>
      <FlatList
        data={tasks.filter(task => task.completed)} // Filter for completed tasks
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={{ width: '100%' }}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Task Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
          />
          <Button title="Add Task" onPress={addTask} />
        </View>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completedTask: {
    backgroundColor: '#eee',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  taskCreatedAt: {
    fontSize: 14,
    color: '#666',
  },
  taskButtons: {
    flexDirection: 'row',
  },
  taskButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});
