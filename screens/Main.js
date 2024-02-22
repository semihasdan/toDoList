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

// Motive edici alıntılar listesi
const motivationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn’t just find you. You have to go out and get it.",
];

export default function Main() {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu state
  const [isModalVisible, setIsModalVisible] = useState(false); // Görev ekleme modalı görünürlüğü
  const [isViewVisible, setIsViewVisible] = useState(false); // Görev detay modalı görünürlüğü
  const [taskTitle, setTaskTitle] = useState(''); // Yeni görevin başlığı
  const [taskDescription, setTaskDescription] = useState(''); // Yeni görevin açıklaması
  const [motivationalQuote, setMotivationalQuote] = useState(''); // Rastgele motive edici alıntı
  const [selectedTask, setSelectedTask] = useState(null); // Seçilen görev

  // Daha önceden kaydedilen görevleri tekrar yükleme
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

  // Görevleri mevcut telefonun deposuna kaydetme
  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error('Failed to save tasks to AsyncStorage:', e);
    }
  };

  // Ekran odaklandığında görevleri yükle
  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  // Görevler değiştiğinde depoya kaydet
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  // Yeni görev ekleme işlemi
  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      completed: false,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    setIsModalVisible(false);
    setTaskTitle('');
    setTaskDescription('');
  };

  // Görev silme işlemi
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Görev tamamlama durumunu değiştirme işlemi
  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  // Görev detaylarını gösterme işlemi
  const showTaskDetails = (task) => {
    setSelectedTask(task);
    setIsViewVisible(true);
    setMotivationalQuote(getRandomQuote());
  };

  // Rastgele motive edici alıntı seçme işlemi
  const getRandomQuote = () => {
    const index = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[index];
  };

  // Görev oluşturulma zamanını metin formatına dönüştürme işlemi
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

  // Görev öğesi render işlemi
  const renderTask = ({ item }) => (
    <TouchableOpacity onPress={() => showTaskDetails(item)}>
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
    </TouchableOpacity>
  );

  // Ana komponentin render işlemi            
  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
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
      <Modal
        isVisible={isViewVisible}
        onBackdropPress={() => setIsViewVisible(false)}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContainer}>
          {selectedTask && (
            <>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>
              <Text style={styles.modalDescription}>{selectedTask.description}</Text>
              <Text style={styles.modalQuote}>NOTE: {motivationalQuote}</Text>
            </>
          )}
          <Button title="Close" onPress={() => setIsViewVisible(false)} />
        </View>
      </Modal>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  modalQuote: {
    top: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
});
