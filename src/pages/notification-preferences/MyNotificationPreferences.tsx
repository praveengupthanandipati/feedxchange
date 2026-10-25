import {
  useGetMyPreferencesQuery,
  usePauseMineMutation,
  useResumeMineMutation,
  useSaveMyPreferencesMutation,
} from "../../store/notificationPreferencesApi";
import { apiErrorMessage } from "../../store/sellerInvoiceApi";
import UserPreferencesPanel from "./UserPreferencesPanel";
import "./Preferences.scss";

/** "My notifications": any signed-in user chooses what reaches them, on which channels, and pauses it while away. */
const MyNotificationPreferences = () => {
  const { data, isLoading, isError, error } = useGetMyPreferencesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [save, { isLoading: saving }] = useSaveMyPreferencesMutation();
  const [pause, { isLoading: pausing }] = usePauseMineMutation();
  const [resume, { isLoading: resuming }] = useResumeMineMutation();

  return (
    <div className="pref-page">
      <header className="pref-page__header">
        <div>
          <h1>My notifications</h1>
          <p>Choose which events reach you and on which channels. Pause them while you are away.</p>
        </div>
      </header>
      {isLoading && <div className="pref-state">Loading your preferences…</div>}
      {isError && <div className="pref-state pref-state--error" role="alert">{apiErrorMessage(error, "Could not load your preferences.")}</div>}
      {data && (
        <UserPreferencesPanel
          prefs={data}
          busy={saving || pausing || resuming}
          onSave={(subscriptions) => save(subscriptions).unwrap()}
          onPause={(resumeOn, reason) => pause({ resumeOn, reason }).unwrap()}
          onResume={() => resume().unwrap()}
        />
      )}
    </div>
  );
};

export default MyNotificationPreferences;
