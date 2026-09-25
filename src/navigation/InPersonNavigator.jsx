import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useStackScreenOptions } from "./navigationConfig";
import InPersonHomeScreen from "../pages/UI/InPerson/InPersonHomeScreen";
import AddAppointmentScreen from "../pages/UI/InPerson/AddAppointmentScreen";

const Stack = createNativeStackNavigator();

export default function InPersonNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="InPersonHome" component={InPersonHomeScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
    </Stack.Navigator>
  );
}
