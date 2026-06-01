import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { sharedScreenOptions } from "./navigationConfig";
import InPersonHomeScreen from "../pages/UI/InPerson/InPersonHomeScreen";
import AddAppointmentScreen from "../pages/UI/InPerson/AddAppointmentScreen";

const Stack = createNativeStackNavigator();

export default function InPersonNavigator() {
  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen name="InPersonHome" component={InPersonHomeScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
    </Stack.Navigator>
  );
}
