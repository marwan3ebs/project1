import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/index.js';

export function TeamHierarchyTree({ teams = [], agents = [], manager }) {
  return (
    <View style={styles.tree}>
      <Text style={styles.manager}>Manager: {manager?.name || 'Company manager'}</Text>
      {teams.map((team) => {
        const leaders = agents.filter((agent) => team.teamLeaderIds?.includes(agent.id) || team.leaderId === agent.id);
        const members = agents.filter((agent) => agent.teamId === team.id && agent.role === 'agent');
        return (
          <View key={team.id} style={styles.team}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.meta}>Leader: {leaders.map((leader) => leader.name).join(', ') || 'Unassigned'}</Text>
            <Text style={styles.meta}>Agents: {members.map((agent) => agent.name).join(', ') || 'No agents'}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tree: { gap: spacing[3] },
  manager: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  team: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: spacing[3] },
  teamName: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  meta: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 3 },
});
