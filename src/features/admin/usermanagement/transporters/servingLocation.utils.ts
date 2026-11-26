/** Serving Locations of a transporter: where goods are picked up (source) and where they are delivered (destination). */
export interface ServingLocationValue {
  sourceStates: string[];
  destinationStates: string[];
}

/** True when both lists have at least one state: what a transporter profile needs before it is saved. */
export const hasServingLocations = (value: ServingLocationValue) => value.sourceStates.length > 0 && value.destinationStates.length > 0;

export const SERVING_LOCATIONS_REQUIRED = "Select at least one source state and one destination state.";
