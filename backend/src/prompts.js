

const FILTER_PROMPTS = {
  vintage:
    'Apply a warm vintage film aesthetic: faded highlights, slightly lifted blacks, gentle yellow-orange tone, subtle film grain, mild vignette. Preserve all subject details and composition exactly.',
  bw:
    'Convert to a rich black and white photograph with strong tonal contrast and deep blacks reminiscent of classic film photography. Preserve all subject details and composition exactly.',
  cinematic:
    'Apply a cinematic teal-and-orange color grade: warm skin tones, cool teal shadows, slightly crushed blacks, soft contrast curve. Preserve all subject details and composition exactly.',
  warm:
    'Add warm golden-hour lighting: gentle amber tones, soft glowing highlights, warmer skin tones. Preserve all subject details and composition exactly.',
  cool:
    'Apply a cool blue color tone: subtle cyan shadows, crisp highlights, calm winter atmosphere. Preserve all subject details and composition exactly.',
  dramatic:
    'Increase dramatic contrast: deeper shadows, brighter highlights, richer color saturation, moody atmosphere. Preserve all subject details and composition exactly.',
};

export function buildPrompt(operation, params = {}) {
  switch (operation) {
    case 'filter': {
      return FILTER_PROMPTS[params.filter] || FILTER_PROMPTS.vintage;
    }

    case 'clothes': {
      const desc = (params.description || '').trim();
      if (!desc) throw new Error('Please describe the new outfit.');
      return `Change the clothing of the main person in this photo to: ${desc}. Keep the person's face, skin tone, hair, pose, body proportions, and the entire background completely unchanged. Only the clothing should change. Make the new clothing look photorealistic with natural fabric folds, lighting, and shadows that match the original scene.`;
    }

    case 'background': {
      const desc = (params.description || '').trim();
      if (!desc) throw new Error('Please describe the new background.');
      return `Replace the background of this photo with: ${desc}. Keep the main subject (person or object) in the foreground completely unchanged — same pose, same lighting on the subject, same edges. The new background should look photorealistic with depth, perspective, and lighting consistent with how the original subject is lit.`;
    }

    case 'object': {
      const action = params.action === 'remove' ? 'remove' : 'add';
      const desc = (params.description || '').trim();
      if (!desc) throw new Error(`Please describe what to ${action}.`);

      if (action === 'add') {
        return `Add the following to this photo: ${desc}. Place it naturally in the scene with realistic size, perspective, lighting, and shadows that match the existing image. Keep everything else in the photo exactly the same.`;
      }
      return `Remove the following from this photo: ${desc}. Reconstruct the area behind it so it looks like it was never there, matching the surrounding textures, lighting, and perspective. Keep everything else in the photo exactly the same.`;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
