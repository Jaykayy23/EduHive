// Verified with a real, bounded provider request during release checks.
// Deployments can select another supported model through NVIDIA_MODEL.
export const DEFAULT_TUTOR_MODEL = "nvidia/nemotron-3.5-bolt-e4b";

export function getTutorModel(configured = process.env.NVIDIA_MODEL): string {
  return configured?.trim() || DEFAULT_TUTOR_MODEL;
}
